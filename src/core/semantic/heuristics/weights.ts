import type { SignalKind } from "../types";

export const SIGNAL_WEIGHTS: Record<SignalKind, number> = {
  topic: 1.4,
  definition: 2.2,
  conclusion: 2.0,
  pivot: 1.6,
  actionable: 1.5,
  evidence: 0.9,
  structural: 0.6
};

export const LENGTH_SWEET_SPOT = { min: 8, max: 32 };
