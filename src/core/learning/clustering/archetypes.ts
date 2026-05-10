import type { Archetype, ArchetypeMembership, SessionFeatureVector } from "../types";

interface Centroid {
  id: Archetype;
  vector: SessionFeatureVector;
}

const CENTROIDS: Centroid[] = [
  {
    id: "scanner",
    vector: {
      velocityMean: 0.55,
      fatigueMean: 0.25,
      engagementMean: 0.25,
      focusMean: 0.45,
      abandonmentMean: 0.55,
      loadMean: 0.3
    }
  },
  {
    id: "deep-reader",
    vector: {
      velocityMean: 0.1,
      fatigueMean: 0.25,
      engagementMean: 0.75,
      focusMean: 0.7,
      abandonmentMean: 0.15,
      loadMean: 0.35
    }
  },
  {
    id: "fragile",
    vector: {
      velocityMean: 0.2,
      fatigueMean: 0.65,
      engagementMean: 0.35,
      focusMean: 0.4,
      abandonmentMean: 0.45,
      loadMean: 0.6
    }
  },
  {
    id: "balanced",
    vector: {
      velocityMean: 0.25,
      fatigueMean: 0.35,
      engagementMean: 0.5,
      focusMean: 0.55,
      abandonmentMean: 0.3,
      loadMean: 0.4
    }
  }
];

const TEMPERATURE = 0.18;

function distance(a: SessionFeatureVector, b: SessionFeatureVector): number {
  const keys: (keyof SessionFeatureVector)[] = [
    "velocityMean",
    "fatigueMean",
    "engagementMean",
    "focusMean",
    "abandonmentMean",
    "loadMean"
  ];
  let sum = 0;
  for (const k of keys) {
    const d = a[k] - b[k];
    sum += d * d;
  }
  return Math.sqrt(sum);
}

export function classifyArchetype(features: SessionFeatureVector): ArchetypeMembership {
  const distances = CENTROIDS.map((c) => ({ id: c.id, d: distance(features, c.vector) }));
  const negs = distances.map((x) => -x.d / TEMPERATURE);
  const max = Math.max(...negs);
  const exps = negs.map((n) => Math.exp(n - max));
  const sum = exps.reduce((acc, v) => acc + v, 0);
  const out: ArchetypeMembership = { scanner: 0, "deep-reader": 0, fragile: 0, balanced: 0 };
  distances.forEach((x, i) => {
    out[x.id] = exps[i] / sum;
  });
  return out;
}

export function dominantArchetype(membership: ArchetypeMembership): Archetype {
  let best: Archetype = "balanced";
  let max = -Infinity;
  for (const id of Object.keys(membership) as Archetype[]) {
    if (membership[id] > max) {
      max = membership[id];
      best = id;
    }
  }
  return best;
}
