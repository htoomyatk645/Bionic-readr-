import type { BehaviorSnapshot } from "../types";
import { DEFAULT_PROFILE, type PersonalizationProfile } from "./profile";

const ALPHA_FAST = 0.06;
const ALPHA_SLOW = 0.015;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function ewma(prev: number, sample: number, alpha: number): number {
  return prev + alpha * (sample - prev);
}

export function updateProfile(
  profile: PersonalizationProfile,
  snapshot: BehaviorSnapshot
): PersonalizationProfile {
  const next: PersonalizationProfile = { ...profile };

  if (snapshot.state === "focused" || snapshot.state === "studying") {
    next.preferredFixationStrength = ewma(
      next.preferredFixationStrength,
      next.preferredFixationStrength,
      ALPHA_SLOW
    );
  } else if (snapshot.state === "fatigued") {
    next.fatigueThreshold = clamp(
      ewma(next.fatigueThreshold, snapshot.fatigueScore, ALPHA_FAST),
      0.35,
      0.85
    );
  } else if (snapshot.state === "drifting") {
    next.radarSensitivity = clamp(
      ewma(next.radarSensitivity, 0.7, ALPHA_FAST),
      0.2,
      0.95
    );
    next.preferredLineHeight = clamp(
      ewma(next.preferredLineHeight, 1.7, ALPHA_FAST),
      1.4,
      1.95
    );
  } else if (snapshot.state === "scanning") {
    next.preferredParagraphSpacing = clamp(
      ewma(next.preferredParagraphSpacing, 0.95, ALPHA_SLOW),
      0.7,
      1.4
    );
  }

  next.pacingTolerance = clamp(
    ewma(next.pacingTolerance, snapshot.pacingStability, ALPHA_SLOW),
    0.1,
    0.95
  );

  return next;
}

export function recordSessionEnd(
  profile: PersonalizationProfile,
  durationMs: number
): PersonalizationProfile {
  if (durationMs < 5000) return profile;
  const observedSessions = profile.observedSessions + 1;
  const averageSessionMs =
    profile.observedSessions === 0
      ? durationMs
      : profile.averageSessionMs +
        (durationMs - profile.averageSessionMs) / observedSessions;
  return { ...profile, observedSessions, averageSessionMs };
}

export { DEFAULT_PROFILE };
