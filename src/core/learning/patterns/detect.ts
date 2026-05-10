import type { SessionDigest } from "../types";

export interface PatternSummary {
  stableEngagement: boolean;
  recurringFatigue: boolean;
  fragileAttention: boolean;
  fatigueOnsetMs: number | null;
  recoveryHalfLifeMs: number | null;
  preferredDurationMs: number | null;
}

const STABLE_ENGAGEMENT_VARIANCE = 0.025;
const FATIGUE_RECURRENCE_RATIO = 0.4;
const FRAGILE_ATTENTION_RATIO = 0.35;

export function detectPatterns(digests: readonly SessionDigest[]): PatternSummary {
  if (digests.length === 0) {
    return {
      stableEngagement: false,
      recurringFatigue: false,
      fragileAttention: false,
      fatigueOnsetMs: null,
      recoveryHalfLifeMs: null,
      preferredDurationMs: null
    };
  }

  const engagementValues = digests.map((d) => d.meanEngagement);
  const stableEngagement = variance(engagementValues) < STABLE_ENGAGEMENT_VARIANCE;

  const fatigueProne = digests.filter((d) => d.fatigueEpisodes > 0).length;
  const recurringFatigue = fatigueProne / digests.length >= FATIGUE_RECURRENCE_RATIO;

  const fragile =
    digests.filter((d) => d.driftEpisodes + d.abandonmentSpikes >= 2).length / digests.length;
  const fragileAttention = fragile >= FRAGILE_ATTENTION_RATIO;

  return {
    stableEngagement,
    recurringFatigue,
    fragileAttention,
    fatigueOnsetMs: estimateFatigueOnset(digests),
    recoveryHalfLifeMs: estimateRecoveryHalfLife(digests),
    preferredDurationMs: median(digests.map((d) => d.durationMs))
  };
}

function variance(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  let sum = 0;
  for (const v of values) sum += (v - mean) * (v - mean);
  return sum / (values.length - 1);
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function estimateFatigueOnset(digests: readonly SessionDigest[]): number | null {
  const fatigued = digests.filter((d) => d.fatigueEpisodes > 0 && d.durationMs > 0);
  if (fatigued.length === 0) return null;
  const onsets = fatigued.map((d) => d.durationMs * (1 - d.fatigueEpisodes / Math.max(1, durationSamples(d))));
  return median(onsets);
}

function durationSamples(d: SessionDigest): number {
  return Math.max(1, Math.round(d.durationMs / 2000));
}

function estimateRecoveryHalfLife(digests: readonly SessionDigest[]): number | null {
  const samples = digests
    .filter((d) => d.fatigueEpisodes > 0 && d.studyEpisodes > 0)
    .map((d) => d.durationMs / (d.studyEpisodes + 1));
  return median(samples);
}
