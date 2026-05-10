import type { BehaviorSnapshot, SignalEvent } from "~core/behavior";
import { detectPatterns, type PatternSummary } from "./patterns/detect";
import {
  createProxyAccumulator,
  ingestSnapshotProxies,
  noteRevisit,
  noteTabHidden,
  noteTabVisible,
  notePause,
  summarize,
  type EmotionalProxies,
  type ProxyAccumulator
} from "./emotional/proxies";
import { updateEmotional } from "./emotional/calibration";
import {
  createAccumulator,
  digest,
  ingestSnapshot,
  noteActiveDuration,
  type SessionAccumulator
} from "./trajectory/record";
import { integrateSessionDigest, integrateSnapshot } from "./evolution/safe";
import {
  loadCognitive,
  loadEmotional,
  loadTrajectory,
  saveCognitive,
  saveEmotional,
  saveTrajectory
} from "./storage/persist";
import {
  TRAJECTORY_MAX_SESSIONS,
  type EmotionalCalibrationProfile,
  type SessionDigest,
  type TrajectoryRecord,
  type UserCognitiveProfile
} from "./types";

export type {
  Archetype,
  ArchetypeMembership,
  EmotionalCalibrationProfile,
  SessionDigest,
  SessionFeatureVector,
  TrajectoryRecord,
  UserCognitiveProfile
} from "./types";
export type { PatternSummary } from "./patterns/detect";
export type { CognitiveQueryContext } from "./inference/queries";
export {
  expectedFatigueAt,
  predictiveTrust,
  preferredAnimationScale
} from "./inference/queries";
export { dominantArchetype } from "./clustering/archetypes";

const PERSIST_DEBOUNCE_MS = 4_000;
const SESSION_END_MIN_MS = 30_000;

export interface LearningSnapshotView {
  cognitive: UserCognitiveProfile;
  emotional: EmotionalCalibrationProfile;
  patterns: PatternSummary;
  proxies: EmotionalProxies;
  recentDigests: readonly SessionDigest[];
}

export interface LearningEngineHandle {
  ingestBehaviorSnapshot(snapshot: BehaviorSnapshot, velocityHint?: number): void;
  ingestSignalEvent(event: SignalEvent): void;
  noteActiveTime(durationMs: number): void;
  view(): LearningSnapshotView;
  flush(): Promise<void>;
  stop(): Promise<void>;
}

export async function createLearningEngine(): Promise<LearningEngineHandle> {
  let cognitive: UserCognitiveProfile = await loadCognitive();
  let emotional: EmotionalCalibrationProfile = await loadEmotional();
  let trajectory: TrajectoryRecord = await loadTrajectory();
  let patterns: PatternSummary = detectPatterns(trajectory.recent);

  const session: SessionAccumulator = createAccumulator();
  const proxies: ProxyAccumulator = createProxyAccumulator();
  let proxiesSummary: EmotionalProxies = summarize(proxies);
  let lastSnapshot: BehaviorSnapshot | null = null;

  let dirtyCognitive = false;
  let dirtyEmotional = false;
  let dirtyTrajectory = false;
  let persistTimer: number | null = null;

  const schedulePersist = () => {
    if (persistTimer !== null) return;
    const run = async () => {
      persistTimer = null;
      const writes: Promise<void>[] = [];
      if (dirtyCognitive) {
        dirtyCognitive = false;
        writes.push(saveCognitive(cognitive));
      }
      if (dirtyEmotional) {
        dirtyEmotional = false;
        writes.push(saveEmotional(emotional));
      }
      if (dirtyTrajectory) {
        dirtyTrajectory = false;
        writes.push(saveTrajectory(trajectory));
      }
      await Promise.all(writes);
    };
    persistTimer = window.setTimeout(() => {
      const idle = (window as unknown as {
        requestIdleCallback?: (cb: () => void) => void;
      }).requestIdleCallback;
      if (idle) idle(() => void run());
      else void run();
    }, PERSIST_DEBOUNCE_MS);
  };

  const finalizeSession = () => {
    const sessionDigest = digest(session);
    if (!sessionDigest || sessionDigest.durationMs < SESSION_END_MIN_MS) return;
    const recent = trajectory.recent.slice();
    cognitive = integrateSessionDigest(cognitive, sessionDigest, recent);
    recent.push(sessionDigest);
    while (recent.length > TRAJECTORY_MAX_SESSIONS) recent.shift();
    trajectory = { version: trajectory.version, recent };
    patterns = detectPatterns(recent);
    dirtyCognitive = true;
    dirtyTrajectory = true;
  };

  return {
    ingestBehaviorSnapshot(snapshot, velocityHint = 0) {
      ingestSnapshot(session, snapshot, velocityHint);
      ingestSnapshotProxies(proxies, snapshot, lastSnapshot);
      lastSnapshot = snapshot;

      cognitive = integrateSnapshot(cognitive, snapshot);
      proxiesSummary = summarize(proxies);
      emotional = updateEmotional(emotional, proxiesSummary);

      dirtyCognitive = true;
      dirtyEmotional = true;
      schedulePersist();
    },

    ingestSignalEvent(event) {
      switch (event.kind) {
        case "block-revisit":
          noteRevisit(proxies);
          break;
        case "tab-hidden":
          noteTabHidden(proxies, event.at);
          break;
        case "tab-visible":
          noteTabVisible(proxies, event.at);
          break;
        case "user-idle":
          notePause(proxies, event.idleMs);
          break;
        default:
          break;
      }
    },

    noteActiveTime(durationMs) {
      noteActiveDuration(session, durationMs);
    },

    view() {
      return {
        cognitive,
        emotional,
        patterns,
        proxies: proxiesSummary,
        recentDigests: trajectory.recent
      };
    },

    async flush() {
      finalizeSession();
      if (persistTimer !== null) {
        window.clearTimeout(persistTimer);
        persistTimer = null;
      }
      await Promise.all([
        dirtyCognitive ? saveCognitive(cognitive) : Promise.resolve(),
        dirtyEmotional ? saveEmotional(emotional) : Promise.resolve(),
        dirtyTrajectory ? saveTrajectory(trajectory) : Promise.resolve()
      ]);
      dirtyCognitive = false;
      dirtyEmotional = false;
      dirtyTrajectory = false;
    },

    async stop() {
      finalizeSession();
      await this.flush();
    }
  };
}
