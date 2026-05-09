import { DEFAULT_PROFILE, PROFILE_KEY, type PersonalizationProfile } from "./profile";

const area = (() => {
  const c = (globalThis as unknown as { chrome?: typeof chrome }).chrome;
  return c?.storage?.local ?? null;
})();

export async function readProfile(): Promise<PersonalizationProfile> {
  if (!area) return DEFAULT_PROFILE;
  try {
    const result = await area.get(PROFILE_KEY);
    const stored = result?.[PROFILE_KEY] as Partial<PersonalizationProfile> | undefined;
    return { ...DEFAULT_PROFILE, ...(stored ?? {}) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export async function writeProfile(profile: PersonalizationProfile): Promise<void> {
  if (!area) return;
  try {
    await area.set({ [PROFILE_KEY]: profile });
  } catch {
    /* best effort */
  }
}

export async function clearProfile(): Promise<void> {
  if (!area) return;
  try {
    await area.remove(PROFILE_KEY);
  } catch {
    /* best effort */
  }
}
