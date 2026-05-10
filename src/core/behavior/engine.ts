import type { EffectiveSettings } from "~features/settings/types";
import { computeOverlay } from "./adaptation/overlay";
import { FrictionTracker } from "./friction/tracker";
import { BehaviorModel } from "./modeling/snapshot";
import { DEFAULT_PROFILE, type PersonalizationProfile } from "./personalization/profile";
import { readProfile, writeProfile } from "./personalization/store";
import { recordSessionEnd, updateProfile } from "./personalization/learner";
import { createSession, tickSession, type SessionAggregate } from "./sessions/session";
import {
  createSignalBus,
  startDwellSignal,
  startIdleSignal,
  startScrollSignal,
  startVisibilitySignal,
  type DwellSignalHandle,
  type DwellTarget,
  type IdleSignalHandle,
  type ScrollSignalHandle,
  type VisibilitySignalHandle
} from "./signals";
import type {
  AdaptiveOverlay,
  BehaviorSnapshot,
  FrictionMap,
  SignalEvent
} from "./types";

const SNAPSHOT_TICK_MS = 2_000;
const SIGNIFICANT_DELTA = 0.06;

export interface BehaviorTickContext {
  snapshot: BehaviorSnapshot;
  reactiveOverlay: AdaptiveOverlay;
  profile: PersonalizationProfile;
  significant: boolean;
}

export interface BehaviorEngineInputs {
  getBlocks(): { blockId: string; element: HTMLElement }[];
  getEffective(): EffectiveSettings;
  onTick(ctx: BehaviorTickContext): void;
  onSignalEvent?(event: SignalEvent): void;
  onFrictionChange(friction: FrictionMap): void;
}

export interface BehaviorEngineHandle {
  stop(): Promise<void>;
  noteEffectiveSettingsChanged(): void;
  current(): {
    snapshot: BehaviorSnapshot | null;
    overlay: AdaptiveOverlay | null;
    profile: PersonalizationProfile;
    friction: FrictionMap;
    activeMs: number;
  };
}

export function createBehaviorEngine(inputs: BehaviorEngineInputs): BehaviorEngineHandle {
  const bus = createSignalBus();
  const model = new BehaviorModel();
  const friction = new FrictionTracker();

  let profile: PersonalizationProfile = DEFAULT_PROFILE;
  let lastSnapshot: BehaviorSnapshot | null = null;
  let lastOverlay: AdaptiveOverlay | null = null;
  let session: SessionAggregate = createSession();
  let isActive = true;
  let stopped = false;

  const scrollHandle: ScrollSignalHandle = startScrollSignal(bus);
  const idleHandle: IdleSignalHandle = startIdleSignal(bus);
  const visibilityHandle: VisibilitySignalHandle = startVisibilitySignal(bus);
  const dwellHandle: DwellSignalHandle = startDwellSignal(bus);

  const attachedIds = new Set<string>();
  const refreshAttachments = () => {
    const blocks = inputs.getBlocks();
    const fresh: DwellTarget[] = [];
    for (const b of blocks) {
      if (attachedIds.has(b.blockId)) continue;
      attachedIds.add(b.blockId);
      fresh.push({ blockId: b.blockId, element: b.element });
    }
    if (fresh.length > 0) dwellHandle.attach(fresh);
  };

  const unsubscribeBus = bus.subscribe((event) => {
    model.ingest(event);
    friction.ingest(event);
    if (event.kind === "user-active" || event.kind === "scroll") isActive = true;
    if (event.kind === "user-idle" || event.kind === "tab-hidden") isActive = false;
    if (event.kind === "tab-visible") isActive = true;
    inputs.onSignalEvent?.(event);
  });

  const unsubscribeFriction = friction.subscribe((map) => {
    inputs.onFrictionChange(map);
  });

  void readProfile().then((p) => {
    profile = p;
  });

  const isSignificant = (a: BehaviorSnapshot | null, b: BehaviorSnapshot): boolean => {
    if (!a) return true;
    if (a.state !== b.state) return true;
    return (
      Math.abs(a.fatigueScore - b.fatigueScore) >= SIGNIFICANT_DELTA ||
      Math.abs(a.engagementDepth - b.engagementDepth) >= SIGNIFICANT_DELTA ||
      Math.abs(a.focusScore - b.focusScore) >= SIGNIFICANT_DELTA ||
      Math.abs(a.abandonmentRisk - b.abandonmentRisk) >= SIGNIFICANT_DELTA
    );
  };

  const tick = () => {
    if (stopped) return;
    refreshAttachments();
    session = tickSession(session, isActive);
    const snapshot = model.snapshot();
    const significant = isSignificant(lastSnapshot, snapshot);

    const base = inputs.getEffective();
    const reactiveOverlay = computeOverlay(snapshot, profile, base);

    if (significant) {
      lastSnapshot = snapshot;
      lastOverlay = reactiveOverlay;
      profile = updateProfile(profile, snapshot);
      void writeProfile(profile);
    }

    inputs.onTick({ snapshot, reactiveOverlay, profile, significant });
  };

  const interval = window.setInterval(tick, SNAPSHOT_TICK_MS);

  const onPageHide = () => {
    profile = recordSessionEnd(profile, session.totalActiveMs);
    void writeProfile(profile);
  };
  window.addEventListener("pagehide", onPageHide);

  return {
    async stop() {
      if (stopped) return;
      stopped = true;
      window.clearInterval(interval);
      window.removeEventListener("pagehide", onPageHide);
      scrollHandle.stop();
      idleHandle.stop();
      visibilityHandle.stop();
      dwellHandle.stop();
      unsubscribeBus();
      unsubscribeFriction();
      profile = recordSessionEnd(profile, session.totalActiveMs);
      await writeProfile(profile);
    },
    noteEffectiveSettingsChanged() {
      lastSnapshot = null;
    },
    current() {
      return {
        snapshot: lastSnapshot,
        overlay: lastOverlay,
        profile,
        friction: friction.current(),
        activeMs: session.totalActiveMs
      };
    }
  };
}
