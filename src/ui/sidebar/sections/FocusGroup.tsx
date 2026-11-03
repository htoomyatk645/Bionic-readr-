import { useSettings } from "~features/settings/store";
import type { RadarIntensity, SkimLayer } from "~features/settings/types";
import { Group, Row } from "~ui/components/Group";
import { Segmented, type SegmentedOption } from "~ui/components/Segmented";
import { Switch } from "~ui/components/Switch";

const RADAR: SegmentedOption<RadarIntensity>[] = [
  { value: "subtle", label: "Subtle" },
  { value: "medium", label: "Medium" },
  { value: "pronounced", label: "Strong" }
];

const SKIM: SegmentedOption<SkimLayer>[] = [
  { value: "full", label: "Full text" },
  { value: "key", label: "Key points" },
  { value: "headlines", label: "Headlines" }
];

const SKIM_HINT: Record<SkimLayer, string> = {
  full: "Everything is shown at full strength.",
  key: "Dims all but lead and key sentences.",
  headlines: "Hides body text to scan the outline."
};

export function FocusGroup() {
  const radar = useSettings((s) => s.effective.radar);
  const skim = useSettings((s) => s.effective.skimLayer);
  const patchRadar = useSettings((s) => s.patchActiveRadar);
  const setSkim = useSettings((s) => s.setActiveSkimLayer);

  return (
    <Group title="Focus aids" description="Surface what matters, quiet the rest.">
      <Row label="Sentence radar" description="Underline the most important sentences.">
        <Switch
          label="Sentence radar"
          checked={radar.enabled}
          onChange={(enabled) => void patchRadar({ enabled })}
        />
      </Row>
      {radar.enabled && (
        <Row label="Radar strength" stacked>
          <Segmented<RadarIntensity>
            label="Radar strength"
            value={radar.intensity}
            options={RADAR}
            onChange={(intensity) => void patchRadar({ intensity })}
          />
        </Row>
      )}
      <Row label="Skim layer" description={SKIM_HINT[skim]} stacked>
        <Segmented<SkimLayer>
          label="Skim layer"
          value={skim}
          options={SKIM}
          onChange={(layer) => void setSkim(layer)}
        />
      </Row>
    </Group>
  );
}
