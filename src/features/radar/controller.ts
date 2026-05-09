import type { SemanticAnalysis } from "~core/semantic/types";
import type { RadarSettings } from "~features/settings/types";

const RADAR_DOC_ATTR = "data-bionic-redr-radar";
const RADAR_ATTR = "data-radar-important";

export function applyRadar(settings: RadarSettings, analysis: SemanticAnalysis | null): void {
  document.querySelectorAll(`[${RADAR_ATTR}]`).forEach((el) => el.removeAttribute(RADAR_ATTR));

  if (!settings.enabled || !analysis) {
    document.documentElement.removeAttribute(RADAR_DOC_ATTR);
    return;
  }
  document.documentElement.setAttribute(RADAR_DOC_ATTR, settings.intensity);

  for (const id of analysis.importantSentenceIds) {
    const matches = document.querySelectorAll(
      `[data-bionic-redr-sentence][data-sentence-id="${cssEscape(id)}"]`
    );
    matches.forEach((m) => m.setAttribute(RADAR_ATTR, ""));
  }
}

export function clearRadar(): void {
  document.documentElement.removeAttribute(RADAR_DOC_ATTR);
  document.querySelectorAll(`[${RADAR_ATTR}]`).forEach((el) => el.removeAttribute(RADAR_ATTR));
}

function cssEscape(value: string): string {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") return CSS.escape(value);
  return value.replace(/["\\]/g, "\\$&");
}
