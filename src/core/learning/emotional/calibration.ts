import type { EmotionalCalibrationProfile } from "../types";
import type { EmotionalProxies } from "./proxies";

const ALPHA = 0.05;

function clamp01(v: number): number {
  if (Number.isNaN(v)) return 0;
  return Math.max(0, Math.min(1, v));
}

function ewma(prev: number, target: number, alpha: number = ALPHA): number {
  return prev + alpha * (target - prev);
}

export function updateEmotional(
  profile: EmotionalCalibrationProfile,
  proxies: EmotionalProxies
): EmotionalCalibrationProfile {
  const fragility = clamp01(
    (1 - proxies.hesitationSoftness) * 0.4 +
      (1 - proxies.scrollFluidity) * 0.3 +
      proxies.reReadFrustration * 0.3
  );

  const smoothness = clamp01(
    proxies.hesitationSoftness * 0.5 + proxies.scrollFluidity * 0.5
  );

  const recovery = proxies.abandonmentRecoveryMs;
  const recoveryComfort = recovery === 0 ? 0.5 : clamp01(1 - recovery / (5 * 60_000));

  return {
    ...profile,
    comfortCurve: {
      densityComfort: ewma(profile.comfortCurve.densityComfort, smoothness),
      paceComfort: ewma(profile.comfortCurve.paceComfort, proxies.scrollFluidity),
      emphasisComfort: ewma(profile.comfortCurve.emphasisComfort, proxies.reEngagementRate)
    },
    cognitiveSmoothnessPreference: ewma(profile.cognitiveSmoothnessPreference, smoothness),
    toleranceToDensity: ewma(profile.toleranceToDensity, proxies.scrollFluidity),
    transitionSensitivity: ewma(profile.transitionSensitivity, fragility),
    attentionFragilityIndex: ewma(profile.attentionFragilityIndex, fragility),
    predictiveTrust: ewma(profile.predictiveTrust, recoveryComfort, 0.02),
    updatedAt: Date.now()
  };
}
