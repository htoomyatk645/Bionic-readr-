import { Section } from "~ui/components/Section";
import { Segmented, type SegmentedOption } from "~ui/components/Segmented";
import { useSettings } from "~features/settings/store";
import type { SkimLayer } from "~features/settings/types";

const LAYER_OPTIONS: SegmentedOption<SkimLayer>[] = [
  { value: "headlines", label: "Headlines" },
  { value: "key", label: "Key" },
  { value: "full", label: "Full" }
];

export function SkimSection() {
  const layer = useSettings((s) => s.effective.skimLayer);
  const setLayer = useSettings((s) => s.setActiveSkimLayer);

  return (
    <Section title="Skim layer" hint="Reveal information progressively.">
      <Segmented<SkimLayer> value={layer} options={LAYER_OPTIONS} onChange={setLayer} />
    </Section>
  );
}
