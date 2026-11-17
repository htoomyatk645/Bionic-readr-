import { useSettings } from "~features/settings/store";
import type { SkimLayer } from "~features/settings/types";
import { HighlightIcon } from "~ui/components/Icons";
import { Segmented, type SegmentedOption } from "~ui/components/Segmented";

const SKIM: SegmentedOption<SkimLayer>[] = [
  { value: "full", label: "Everything" },
  { value: "key", label: "Key points" },
  { value: "headlines", label: "Outline" }
];

/** What the page shows: full text, key sentences, or just the outline — plus highlights. */
export function ShowControls() {
  const skim = useSettings((s) => s.effective.skimLayer);
  const radar = useSettings((s) => s.effective.radar);
  const setSkim = useSettings((s) => s.setActiveSkimLayer);
  const patchRadar = useSettings((s) => s.patchActiveRadar);

  return (
    <section>
      <div className="mb-2.5 flex items-center justify-between">
        <h3 className="text-[13px] font-medium text-fg-muted">Show</h3>
        <button
          type="button"
          role="switch"
          aria-checked={radar.enabled}
          onClick={() => void patchRadar({ enabled: !radar.enabled })}
          className={
            "inline-flex h-[28px] items-center gap-1.5 rounded-full px-3 text-[13px] font-medium transition-colors " +
            (radar.enabled ? "bg-accent-soft text-accent" : "bg-surface-2 text-fg-muted hover:text-fg")
          }
        >
          <HighlightIcon />
          Highlights {radar.enabled ? "on" : "off"}
        </button>
      </div>
      <Segmented<SkimLayer> label="Show on the page" value={skim} options={SKIM} onChange={(l) => void setSkim(l)} />
    </section>
  );
}
