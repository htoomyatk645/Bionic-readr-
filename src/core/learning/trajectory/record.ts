import type { BehaviorSnapshot, EngagementState } from "~core/behavior";
import type { SessionDigest, SessionFeatureVector } from "../types";
import { classifyArchetype } from "../clustering/archetypes";

interface SessionAccumulator {
  startedAt: number;
  endedAt: number;
  samples: number;
  focusSum: number;
  fatigueSum: number;
  engagementSum: number;
  pacingSum: number;
  loadSum: number;
  abandonmentSum: number;
  velocitySum: number;
  abandonmentSpikes: number;
  driftEpisodes: number;
  fatigueEpisodes: number;
  studyEpisodes: number;
  scanningEpisodes: number;
  stateCounts: Map<EngagementState, number>;
  durationMs: number;
}

export function createAccumulator(now: number = Date.now()): SessionAccumulator {
  return {
    startedAt: now,
    endedAt: now,
    samples: 0,
    focusSum: 0,
    fatigueSum: 0,
    engagementSum: 0,
    pacingSum: 0,
    loadSum: 0,
    abandonmentSum: 0,
    velocitySum: 0,
    abandonmentSpikes: 0,
    driftEpisodes: 0,
    fatigueEpisodes: 0,
    studyEpisodes: 0,
    scanningEpisodes: 0,
    stateCounts: new Map(),
    durationMs: 0
  };
}

export function ingestSnapshot(
  acc: SessionAccumulator,
  snapshot: BehaviorSnapshot,
  velocityHint = 0
): void {
  acc.samples += 1;
  acc.focusSum += snapshot.focusScore;
  acc.fatigueSum += snapshot.fatigueScore;
  acc.engagementSum += snapshot.engagementDepth;
  acc.pacingSum += snapshot.pacingStability;
  acc.loadSum += snapshot.cognitiveLoadEstimate;
  acc.abandonmentSum += snapshot.abandonmentRisk;
  acc.velocitySum += velocityHint;
  acc.endedAt = snapshot.generatedAt;

  if (snapshot.abandonmentRisk > 0.55) acc.abandonmentSpikes += 1;
  if (snapshot.state === "drifting") acc.driftEpisodes += 1;
  if (snapshot.state === "fatigued") acc.fatigueEpisodes += 1;
  if (snapshot.state === "studying") acc.studyEpisodes += 1;
  if (snapshot.state === "scanning") acc.scanningEpisodes += 1;

  acc.stateCounts.set(snapshot.state, (acc.stateCounts.get(snapshot.state) ?? 0) + 1);
}

export function noteActiveDuration(acc: SessionAccumulator, durationMs: number): void {
  acc.durationMs = durationMs;
}

export function digest(acc: SessionAccumulator): SessionDigest | null {
  if (acc.samples === 0) return null;
  const features: SessionFeatureVector = {
    velocityMean: acc.velocitySum / acc.samples,
    fatigueMean: acc.fatigueSum / acc.samples,
    engagementMean: acc.engagementSum / acc.samples,
    focusMean: acc.focusSum / acc.samples,
    abandonmentMean: acc.abandonmentSum / acc.samples,
    loadMean: acc.loadSum / acc.samples
  };
  let dominant: EngagementState = "focused";
  let maxCount = 0;
  for (const [s, c] of acc.stateCounts) {
    if (c > maxCount) {
      dominant = s;
      maxCount = c;
    }
  }
  return {
    startedAt: acc.startedAt,
    endedAt: acc.endedAt,
    durationMs: acc.durationMs || acc.endedAt - acc.startedAt,
    meanFocus: features.focusMean,
    meanFatigue: features.fatigueMean,
    meanEngagement: features.engagementMean,
    meanPacing: acc.pacingSum / acc.samples,
    meanLoad: features.loadMean,
    abandonmentSpikes: acc.abandonmentSpikes,
    driftEpisodes: acc.driftEpisodes,
    fatigueEpisodes: acc.fatigueEpisodes,
    studyEpisodes: acc.studyEpisodes,
    scanningEpisodes: acc.scanningEpisodes,
    dominantState: dominant,
    features,
    archetypeMembership: classifyArchetype(features)
  };
}

export type { SessionAccumulator };
