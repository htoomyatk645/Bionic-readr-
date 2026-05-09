import { Row } from "~ui/components/Row";
import { Section } from "~ui/components/Section";
import { Segmented, type SegmentedOption } from "~ui/components/Segmented";
import { Switch } from "~ui/components/Switch";
import { useSettings } from "~features/settings/store";
import type { RadarIntensity } from "~features/settings/types";

const INTENSITY_OPTIONS: SegmentedOption<RadarIntensity>[] = [
  { value: "subtle", label: "Subtle" },
  { value: "medium", label: "Medium" },
  { value: "pronounced", label: "Pronounced" }
];

export function RadarSection() {
  const radar = useSettings((s) => s.effective.radar);
  const patch = useSettings((s) => s.patchActiveRadar);

  return (
    <Section title="Sentence radar" hint="Subtly surface what matters most.">
      <Row label="Highlight key sentences" hint={radar.enabled ? "Tasteful underline" : "Off"}>
        <Switch checked={radar.enabled} onChange={(enabled) => patch({ enabled })} />
      </Row>
      {radar.enabled && (
        <Segmented<RadarIntensity>
          value={radar.intensity}
          options={INTENSITY_OPTIONS}
          onChange={(intensity) => patch({ intensity })}
        />
      )}
    </Section>
  );
}
