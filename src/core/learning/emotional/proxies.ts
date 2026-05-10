import type { BehaviorSnapshot } from "~core/behavior";

export interface EmotionalProxies {
  hesitationSoftness: number;
  scrollFluidity: number;
  reEngagementRate: number;
  reReadFrustration: number;
  abandonmentRecoveryMs: number;
}

export interface ProxyAccumulator {
  pauseSamples: number[];
  velocityVarianceSamples: number[];
  driftToActiveCount: number;
  totalDriftCount: number;
  revisitCount: number;
  abandonmentRecoveryMs: number[];
  lastDriftAt: number | null;
  lastTabHiddenAt: number | null;
}

export function createProxyAccumulator(): ProxyAccumulator {
  return {
    pauseSamples: [],
    velocityVarianceSamples: [],
    driftToActiveCount: 0,
    totalDriftCount: 0,
    revisitCount: 0,
    abandonmentRecoveryMs: [],
    lastDriftAt: null,
    lastTabHiddenAt: null
  };
}

export function ingestSnapshotProxies(
  acc: ProxyAccumulator,
  current: BehaviorSnapshot,
  prev: BehaviorSnapshot | null
): void {
  if (!prev) return;
  if (prev.state === "drifting" && current.state !== "drifting") acc.driftToActiveCount += 1;
  if (current.state === "drifting" && prev.state !== "drifting") acc.totalDriftCount += 1;

  const pacingDelta = Math.abs(current.pacingStability - prev.pacingStability);
  acc.velocityVarianceSamples.push(pacingDelta);
  if (acc.velocityVarianceSamples.length > 60) acc.velocityVarianceSamples.shift();
}

export function noteRevisit(acc: ProxyAccumulator): void {
  acc.revisitCount += 1;
}

export function noteTabHidden(acc: ProxyAccumulator, at: number): void {
  acc.lastTabHiddenAt = at;
}

export function noteTabVisible(acc: ProxyAccumulator, at: number): void {
  if (acc.lastTabHiddenAt !== null) {
    acc.abandonmentRecoveryMs.push(at - acc.lastTabHiddenAt);
    if (acc.abandonmentRecoveryMs.length > 20) acc.abandonmentRecoveryMs.shift();
    acc.lastTabHiddenAt = null;
  }
}

export function notePause(acc: ProxyAccumulator, durationMs: number): void {
  acc.pauseSamples.push(durationMs);
  if (acc.pauseSamples.length > 80) acc.pauseSamples.shift();
}

export function summarize(acc: ProxyAccumulator): EmotionalProxies {
  return {
    hesitationSoftness: clamp01(1 - mean(acc.pauseSamples) / 4000),
    scrollFluidity: clamp01(1 - mean(acc.velocityVarianceSamples) * 4),
    reEngagementRate:
      acc.totalDriftCount === 0 ? 0.5 : clamp01(acc.driftToActiveCount / acc.totalDriftCount),
    reReadFrustration: clamp01(acc.revisitCount / 10),
    abandonmentRecoveryMs: median(acc.abandonmentRecoveryMs) ?? 0
  };
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function clamp01(v: number): number {
  if (Number.isNaN(v)) return 0;
  return Math.max(0, Math.min(1, v));
}
