export { createBehaviorEngine, type BehaviorEngineHandle, type BehaviorEngineInputs } from "./engine";
export { applyRelief, clearRelief, type ReliefTarget } from "./friction/relief";
export { computeOverlay, applyOverlay } from "./adaptation/overlay";
export type {
  AdaptiveOverlay,
  AppliedAdaptation,
  BehaviorSnapshot,
  EngagementState,
  FrictionEntry,
  FrictionMap,
  SignalEvent
} from "./types";
export { NEUTRAL_OVERLAY } from "./types";
export type { PersonalizationProfile } from "./personalization/profile";
export { DEFAULT_PROFILE } from "./personalization/profile";
export { clearProfile } from "./personalization/store";
