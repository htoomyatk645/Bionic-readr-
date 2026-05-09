import type { SemanticAnalysis } from "~core/semantic/types";
import type { SkimLayer } from "~features/settings/types";
import type { DiscoveredBlock } from "~core/dom/structure";

const SKIM_DOC_ATTR = "data-bionic-redr-skim";
const KEEP_ATTR = "data-skim-keep";

export function applySkimLayer(
  layer: SkimLayer,
  discovered: DiscoveredBlock[],
  analysis: SemanticAnalysis | null
): void {
  document.documentElement.setAttribute(SKIM_DOC_ATTR, layer);

  const allSentences = document.querySelectorAll(`[data-bionic-redr-sentence]`);
  allSentences.forEach((s) => s.removeAttribute(KEEP_ATTR));

  if (layer === "full") return;

  if (layer === "key") {
    const importantIds = analysis?.importantSentenceIds ?? new Set<string>();
    const keepIds = new Set<string>(importantIds);
    for (const { block } of discovered) {
      if (block.kind === "heading") {
        for (const s of block.sentences) keepIds.add(s.id);
        continue;
      }
      const first = block.sentences[0];
      if (first) keepIds.add(first.id);
    }
    for (const id of keepIds) {
      const matches = document.querySelectorAll(
        `[data-bionic-redr-sentence][data-sentence-id="${cssEscape(id)}"]`
      );
      matches.forEach((m) => m.setAttribute(KEEP_ATTR, ""));
    }
  }
}

export function clearSkim(): void {
  document.documentElement.removeAttribute(SKIM_DOC_ATTR);
  document.querySelectorAll(`[data-skim-keep]`).forEach((s) => s.removeAttribute("data-skim-keep"));
}

function cssEscape(value: string): string {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") return CSS.escape(value);
  return value.replace(/["\\]/g, "\\$&");
}
