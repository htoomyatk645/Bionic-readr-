import type { Intensity } from "~core/bionic/types";
import { useSettings } from "~features/settings/store";
import { Group, Row } from "~ui/components/Group";
import { Segmented, type SegmentedOption } from "~ui/components/Segmented";
import { Slider } from "~ui/components/Slider";
import { Switch } from "~ui/components/Switch";

const INTENSITY: SegmentedOption<Intensity>[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "max", label: "Max" }
];

export function ReadingGroup() {
  const bionic = useSettings((s) => s.effective.bionic);
  const patch = useSettings((s) => s.patchActiveBionic);

  return (
    <Group title="Bionic emphasis" description="Bold the start of each word to guide your eye.">
      <Row label="Emphasis" description={bionic.enabled ? "Anchors are bolded" : "Text is left as-is"}>
        <Switch
          label="Bionic emphasis"
          checked={bionic.enabled}
          onChange={(enabled) => void patch({ enabled })}
        />
      </Row>
      {bionic.enabled && (
        <>
          <Row label="Intensity" stacked>
            <Segmented<Intensity>
              label="Emphasis intensity"
              value={bionic.intensity}
              options={INTENSITY}
              onChange={(intensity) => void patch({ intensity })}
            />
          </Row>
          <Slider
            label="Fixation strength"
            min={0.6}
            max={1.4}
            step={0.05}
            value={bionic.fixationStrength}
            onChange={(fixationStrength) => void patch({ fixationStrength })}
            format={(v) => `${Math.round(v * 100)}%`}
          />
        </>
      )}
    </Group>
  );
}
