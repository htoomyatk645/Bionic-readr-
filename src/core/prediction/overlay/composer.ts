import type { AdaptiveOverlay } from "~core/behavior";
import { NEUTRAL_OVERLAY } from "~core/behavior";
import type { CognitiveQueryContext } from "~core/learning";
import type { PredictiveAdaptiveOverlay, PredictiveSignal } from "../types";

const PROACTIVE_BIAS = 0.6;

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function predictiveOverlay(
  signal: PredictiveSignal,
  ctx: CognitiveQueryContext
): PredictiveAdaptiveOverlay {
  const { fatigueRisk, engagementDropRisk, abandonmentRisk, pacingMismatchRisk } = signal.risks;
  const trust = signal.confidence.combined;
  const fragility = ctx.emotional.attentionFragilityIndex;

  const overlay: AdaptiveOverlay = {
    bionic: { fixationStrengthDelta: 0, intensityShift: 0 },
    typography: { lineHeightDelta: 0, paragraphSpacingDelta: 0, letterSpacingDelta: 0 },
    skim: { forcedLayer: null },
    radar: { intensityShift: 0 },
    animation: { speedFactor: 1 }
  };

  if (fatigueRisk > 0.4) {
    const k = fatigueRisk * trust * PROACTIVE_BIAS * (0.7 + 0.3 * fragility);
    overlay.bionic.fixationStrengthDelta = -0.04 * k;
    overlay.typography.lineHeightDelta = 0.08 * k;
    overlay.typography.paragraphSpacingDelta = 0.14 * k;
    overlay.typography.letterSpacingDelta = 0.003 * k;
    overlay.animation.speedFactor = 1 + 0.35 * k;
    if (fatigueRisk > 0.7 && trust > 0.45) overlay.bionic.intensityShift = -1;
  }

  if (engagementDropRisk > 0.45) {
    const k = engagementDropRisk * trust * PROACTIVE_BIAS;
    overlay.radar.intensityShift = ctx.cognitive.semanticTolerance > 0.45 ? 1 : 0;
    overlay.typography.lineHeightDelta = Math.max(overlay.typography.lineHeightDelta, 0.05 * k);
    overlay.animation.speedFactor = Math.max(overlay.animation.speedFactor, 1 + 0.2 * k);
  }

  if (abandonmentRisk > 0.5 && ctx.cognitive.frictionSusceptibility > 0.4) {
    const k = abandonmentRisk * trust * PROACTIVE_BIAS;
    overlay.typography.paragraphSpacingDelta = Math.max(
      overlay.typography.paragraphSpacingDelta,
      0.1 * k
    );
    overlay.typography.lineHeightDelta = Math.max(overlay.typography.lineHeightDelta, 0.06 * k);
  }

  if (pacingMismatchRisk > 0.5) {
    const k = pacingMismatchRisk * trust * PROACTIVE_BIAS;
    overlay.animation.speedFactor = Math.max(overlay.animation.speedFactor, 1 + 0.25 * k);
  }

  overlay.bionic.fixationStrengthDelta = clamp(overlay.bionic.fixationStrengthDelta, -0.08, 0.04);
  overlay.typography.lineHeightDelta = clamp(overlay.typography.lineHeightDelta, -0.02, 0.14);
  overlay.typography.paragraphSpacingDelta = clamp(overlay.typography.paragraphSpacingDelta, -0.02, 0.18);
  overlay.typography.letterSpacingDelta = clamp(overlay.typography.letterSpacingDelta, -0.002, 0.008);
  overlay.animation.speedFactor = clamp(overlay.animation.speedFactor, 1, 1.5);

  return { ...overlay, predictive: true };
}

export function composeOverlays(
  reactive: AdaptiveOverlay,
  predictive: AdaptiveOverlay,
  trust: number
): AdaptiveOverlay {
  if (trust <= 0) return reactive;
  const w = clamp(trust, 0, 1);

  return {
    bionic: {
      fixationStrengthDelta:
        reactive.bionic.fixationStrengthDelta + predictive.bionic.fixationStrengthDelta * w,
      intensityShift: pickShift(reactive.bionic.intensityShift, predictive.bionic.intensityShift, w)
    },
    typography: {
      lineHeightDelta:
        reactive.typography.lineHeightDelta + predictive.typography.lineHeightDelta * w,
      paragraphSpacingDelta:
        reactive.typography.paragraphSpacingDelta + predictive.typography.paragraphSpacingDelta * w,
      letterSpacingDelta:
        reactive.typography.letterSpacingDelta + predictive.typography.letterSpacingDelta * w
    },
    skim: {
      forcedLayer: reactive.skim.forcedLayer ?? (w >= 0.6 ? predictive.skim.forcedLayer : null)
    },
    radar: {
      intensityShift: pickShift(reactive.radar.intensityShift, predictive.radar.intensityShift, w)
    },
    animation: {
      speedFactor:
        reactive.animation.speedFactor +
        (predictive.animation.speedFactor - 1) * w
    }
  };
}

function pickShift(
  reactive: -1 | 0 | 1,
  predictive: -1 | 0 | 1,
  trust: number
): -1 | 0 | 1 {
  if (reactive !== 0) return reactive;
  if (trust < 0.5) return 0;
  return predictive;
}

export { NEUTRAL_OVERLAY };
