import type { Archetype, ArchetypeMembership, SessionDigest } from "../types";

const ARCHETYPES: Archetype[] = ["scanner", "deep-reader", "fragile", "balanced"];

export function blendMembership(
  current: ArchetypeMembership,
  digests: readonly SessionDigest[],
  alpha: number
): ArchetypeMembership {
  if (digests.length === 0) return current;
  const recent = aggregateMembership(digests);
  const out: ArchetypeMembership = { ...current };
  for (const a of ARCHETYPES) {
    out[a] = current[a] + alpha * (recent[a] - current[a]);
  }
  return normalize(out);
}

export function aggregateMembership(
  digests: readonly SessionDigest[]
): ArchetypeMembership {
  const sum: ArchetypeMembership = { scanner: 0, "deep-reader": 0, fragile: 0, balanced: 0 };
  if (digests.length === 0) return { scanner: 0.25, "deep-reader": 0.25, fragile: 0.25, balanced: 0.25 };
  for (const d of digests) for (const a of ARCHETYPES) sum[a] += d.archetypeMembership[a];
  for (const a of ARCHETYPES) sum[a] /= digests.length;
  return normalize(sum);
}

export function archetypeStability(
  digests: readonly SessionDigest[]
): number {
  if (digests.length < 3) return 0;
  const mean = aggregateMembership(digests);
  let varianceSum = 0;
  for (const d of digests) {
    for (const a of ARCHETYPES) {
      const delta = d.archetypeMembership[a] - mean[a];
      varianceSum += delta * delta;
    }
  }
  const meanVariance = varianceSum / (digests.length * ARCHETYPES.length);
  return clamp01(1 - Math.sqrt(meanVariance) * 2);
}

function normalize(m: ArchetypeMembership): ArchetypeMembership {
  const total = ARCHETYPES.reduce((acc, a) => acc + m[a], 0);
  if (total <= 0) return { scanner: 0.25, "deep-reader": 0.25, fragile: 0.25, balanced: 0.25 };
  return {
    scanner: m.scanner / total,
    "deep-reader": m["deep-reader"] / total,
    fragile: m.fragile / total,
    balanced: m.balanced / total
  };
}

function clamp01(v: number): number {
  if (Number.isNaN(v)) return 0;
  return Math.max(0, Math.min(1, v));
}
