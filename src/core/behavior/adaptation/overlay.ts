import type { Intensity } from "~core/bionic/types";
import type {
  EffectiveSettings,
  RadarIntensity,
  SkimLayer
} from "~features/settings/types";
import type { PersonalizationProfile } from "../personalization/profile";
import type {
  AdaptiveOverlay,
  AppliedAdaptation,
  BehaviorSnapshot
} from "../types";
import { NEUTRAL_OVERLAY } from "../types";

const INTENSITY_ORDER: Intensity[] = ["low", "medium", "high", "max"];
const RADAR_ORDER: RadarIntensity[] = ["subtle", "medium", "pronounced"];

const BOUNDS = {
  fixationStrengthDelta: { min: -0.12, max: 0.06 },
  lineHeightDelta: { min: -0.05, max: 0.18 },
  paragraphSpacingDelta: { min: -0.05, max: 0.25 },
  letterSpacingDelta: { min: -0.005, max: 0.012 },
  animationSpeedFactor: { min: 1, max: 1.6 }
};

function clamp(value: number, range: { min: number; max: number }): number {
  return Math.max(range.min, Math.min(range.max, value));
}

function shiftIntensity(intensity: Intensity, shift: -1 | 0 | 1): Intensity {
  const idx = INTENSITY_ORDER.indexOf(intensity);
  const next = Math.max(0, Math.min(INTENSITY_ORDER.length - 1, idx + shift));
  return INTENSITY_ORDER[next];
}

function shiftRadar(intensity: RadarIntensity, shift: -1 | 0 | 1): RadarIntensity {
  const idx = RADAR_ORDER.indexOf(intensity);
  const next = Math.max(0, Math.min(RADAR_ORDER.length - 1, idx + shift));
  return RADAR_ORDER[next];
}

export function computeOverlay(
  snapshot: BehaviorSnapshot,
  profile: PersonalizationProfile,
  base: EffectiveSettings
): AdaptiveOverlay {
  const overlay: AdaptiveOverlay = {
    bionic: { fixationStrengthDelta: 0, intensityShift: 0 },
    typography: { lineHeightDelta: 0, paragraphSpacingDelta: 0, letterSpacingDelta: 0 },
    skim: { forcedLayer: null },
    radar: { intensityShift: 0 },
    animation: { speedFactor: 1 }
  };

  const fatigueOver = Math.max(0, snapshot.fatigueScore - profile.fatigueThreshold);

  if (snapshot.state === "fatigued" || fatigueOver > 0.05) {
    const k = Math.min(1, snapshot.fatigueScore + fatigueOver);
    overlay.bionic.fixationStrengthDelta = -0.06 * k;
    overlay.bionic.intensityShift = k > 0.6 ? -1 : 0;
    overlay.typography.lineHeightDelta = 0.1 * k;
    overlay.typography.paragraphSpacingDelta = 0.18 * k;
    overlay.typography.letterSpacingDelta = 0.004 * k;
    overlay.animation.speedFactor = 1 + 0.45 * k;
    if (k > 0.7 && base.skimLayer === "full") overlay.skim.forcedLayer = "key";
  } else if (snapshot.state === "drifting") {
    overlay.radar.intensityShift = base.radar.enabled ? 1 : 0;
    overlay.typography.lineHeightDelta = 0.06;
    overlay.typography.paragraphSpacingDelta = 0.1;
    overlay.animation.speedFactor = 1.2;
  } else if (snapshot.state === "scanning") {
    overlay.bionic.fixationStrengthDelta = 0.04;
    overlay.typography.lineHeightDelta = -0.03;
    overlay.animation.speedFactor = 1;
  } else if (snapshot.state === "studying") {
    overlay.radar.intensityShift = 0;
    overlay.bionic.fixationStrengthDelta = 0.02;
    overlay.animation.speedFactor = 1;
  }

  const sensitivity = profile.radarSensitivity;
  if (sensitivity > 0.65 && base.radar.enabled && overlay.radar.intensityShift === 0) {
    overlay.radar.intensityShift = 1;
  } else if (sensitivity < 0.3 && overlay.radar.intensityShift === 1) {
    overlay.radar.intensityShift = 0;
  }

  return overlay;
}

export function applyOverlay(
  base: EffectiveSettings,
  overlay: AdaptiveOverlay
): AppliedAdaptation {
  const fixation = clamp(
    base.bionic.fixationStrength + overlay.bionic.fixationStrengthDelta,
    { min: 0.6, max: 1.4 }
  );
  const intensity = shiftIntensity(base.bionic.intensity, overlay.bionic.intensityShift);
  const lineHeight = clamp(
    base.typography.lineHeight +
      clamp(overlay.typography.lineHeightDelta, BOUNDS.lineHeightDelta),
    { min: 1.3, max: 2.05 }
  );
  const paragraphSpacing = clamp(
    base.typography.paragraphSpacing +
      clamp(overlay.typography.paragraphSpacingDelta, BOUNDS.paragraphSpacingDelta),
    { min: 0.6, max: 1.6 }
  );
  const letterSpacing = clamp(
    base.typography.letterSpacing +
      clamp(overlay.typography.letterSpacingDelta, BOUNDS.letterSpacingDelta),
    { min: -0.01, max: 0.04 }
  );
  const skimLayer: SkimLayer = overlay.skim.forcedLayer ?? base.skimLayer;
  const radarIntensity = shiftRadar(base.radar.intensity, overlay.radar.intensityShift);
  const animationSpeedFactor = clamp(
    overlay.animation.speedFactor,
    BOUNDS.animationSpeedFactor
  );

  return {
    bionicFixationStrength: fixation,
    bionicIntensity: intensity,
    lineHeight,
    letterSpacing,
    paragraphSpacing,
    skimLayer,
    radarIntensity,
    animationSpeedFactor
  };
}

export { NEUTRAL_OVERLAY };
