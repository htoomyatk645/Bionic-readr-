import {
  defaultCognitive,
  defaultEmotional,
  migrateCognitive,
  migrateEmotional,
  migrateTrajectory
} from "./migrations";
import {
  TRAJECTORY_VERSION,
  type EmotionalCalibrationProfile,
  type TrajectoryRecord,
  type UserCognitiveProfile
} from "../types";

export const COGNITIVE_KEY = "bionic-redr.cognitive-profile.v1";
export const EMOTIONAL_KEY = "bionic-redr.emotional-profile.v1";
export const TRAJECTORY_KEY = "bionic-redr.trajectory.v1";

const area = (() => {
  const c = (globalThis as unknown as { chrome?: typeof chrome }).chrome;
  return c?.storage?.local ?? null;
})();

async function readKey<T>(key: string): Promise<T | null> {
  if (!area) return null;
  try {
    const result = await area.get(key);
    return (result?.[key] as T | undefined) ?? null;
  } catch {
    return null;
  }
}

async function writeKey<T>(key: string, value: T): Promise<void> {
  if (!area) return;
  try {
    await area.set({ [key]: value });
  } catch {
    /* best effort */
  }
}

export async function loadCognitive(): Promise<UserCognitiveProfile> {
  const raw = await readKey<unknown>(COGNITIVE_KEY);
  return migrateCognitive(raw) ?? defaultCognitive();
}

export async function saveCognitive(profile: UserCognitiveProfile): Promise<void> {
  await writeKey(COGNITIVE_KEY, profile);
}

export async function loadEmotional(): Promise<EmotionalCalibrationProfile> {
  const raw = await readKey<unknown>(EMOTIONAL_KEY);
  return migrateEmotional(raw) ?? defaultEmotional();
}

export async function saveEmotional(profile: EmotionalCalibrationProfile): Promise<void> {
  await writeKey(EMOTIONAL_KEY, profile);
}

export async function loadTrajectory(): Promise<TrajectoryRecord> {
  const raw = await readKey<unknown>(TRAJECTORY_KEY);
  return migrateTrajectory(raw) ?? { version: TRAJECTORY_VERSION, recent: [] };
}

export async function saveTrajectory(record: TrajectoryRecord): Promise<void> {
  await writeKey(TRAJECTORY_KEY, record);
}

export async function clearAllLearning(): Promise<void> {
  if (!area) return;
  try {
    await area.remove([COGNITIVE_KEY, EMOTIONAL_KEY, TRAJECTORY_KEY]);
  } catch {
    /* best effort */
  }
}
