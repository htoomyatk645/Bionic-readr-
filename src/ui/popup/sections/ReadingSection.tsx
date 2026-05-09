import { Row } from "~ui/components/Row";
import { Section } from "~ui/components/Section";
import { Segmented, type SegmentedOption } from "~ui/components/Segmented";
import { Slider } from "~ui/components/Slider";
import { Switch } from "~ui/components/Switch";
import { useSettings } from "~features/settings/store";
import type { Intensity } from "~core/bionic/types";

const INTENSITY_OPTIONS: SegmentedOption<Intensity>[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "max", label: "Max" }
];

export function ReadingSection() {
  const bionic = useSettings((s) => s.effective.bionic);
  const patch = useSettings((s) => s.patchActiveBionic);

  return (
    <Section title="Reading">
      <Row label="Bionic emphasis" hint={bionic.enabled ? "Anchors guide your eye" : "Off"}>
        <Switch checked={bionic.enabled} onChange={(enabled) => patch({ enabled })} />
      </Row>
      {bionic.enabled && (
        <>
          <div className="space-y-2">
            <div className="text-[12px] text-ink-500 dark:text-ink-300">Intensity</div>
            <Segmented<Intensity>
              value={bionic.intensity}
              options={INTENSITY_OPTIONS}
              onChange={(intensity) => patch({ intensity })}
            />
          </div>
          <Slider
            label="Fixation strength"
            min={0.6}
            max={1.4}
            step={0.05}
            value={bionic.fixationStrength}
            onChange={(fixationStrength) => patch({ fixationStrength })}
            format={(v) => `${Math.round(v * 100)}%`}
          />
        </>
      )}
    </Section>
  );
}
