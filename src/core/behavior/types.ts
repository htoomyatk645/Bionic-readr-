import type { Intensity } from "~core/bionic/types";
import type { RadarIntensity, SkimLayer } from "~features/settings/types";

export type EngagementState =
  | "scanning"
  | "focused"
  | "studying"
  | "drifting"
  | "fatigued";

export interface BehaviorSnapshot {
  focusScore: number;
  fatigueScore: number;
  engagementDepth: number;
  pacingStability: number;
  abandonmentRisk: number;
  cognitiveLoadEstimate: number;
  state: EngagementState;
  generatedAt: number;
}

export interface AdaptiveOverlay {
  bionic: {
    fixationStrengthDelta: number;
    intensityShift: -1 | 0 | 1;
  };
  typography: {
    lineHeightDelta: number;
    paragraphSpacingDelta: number;
    letterSpacingDelta: number;
  };
  skim: {
    forcedLayer: SkimLayer | null;
  };
  radar: {
    intensityShift: -1 | 0 | 1;
  };
  animation: {
    speedFactor: number;
  };
}

export interface AppliedAdaptation {
  bionicFixationStrength: number;
  bionicIntensity: Intensity;
  lineHeight: number;
  letterSpacing: number;
  paragraphSpacing: number;
  skimLayer: SkimLayer;
  radarIntensity: RadarIntensity;
  animationSpeedFactor: number;
}

export interface FrictionEntry {
  blockId: string;
  score: number;
  visits: number;
  lastObservedAt: number;
}

export interface FrictionMap {
  entries: ReadonlyMap<string, FrictionEntry>;
  highRelief: ReadonlySet<string>;
}

export type SignalEvent =
  | { kind: "scroll"; deltaY: number; velocity: number; at: number }
  | { kind: "scroll-direction-flip"; at: number }
  | { kind: "dwell-enter"; blockId: string; at: number }
  | { kind: "dwell-exit"; blockId: string; durationMs: number; at: number }
  | { kind: "block-revisit"; blockId: string; visit: number; at: number }
  | { kind: "user-active"; at: number }
  | { kind: "user-idle"; idleMs: number; at: number }
  | { kind: "tab-hidden"; at: number }
  | { kind: "tab-visible"; awayMs: number; at: number };

export const NEUTRAL_OVERLAY: AdaptiveOverlay = {
  bionic: { fixationStrengthDelta: 0, intensityShift: 0 },
  typography: { lineHeightDelta: 0, paragraphSpacingDelta: 0, letterSpacingDelta: 0 },
  skim: { forcedLayer: null },
  radar: { intensityShift: 0 },
  animation: { speedFactor: 1 }
};
