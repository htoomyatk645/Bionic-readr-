import type { Intensity } from "~core/bionic/types";
import { useSettings } from "~features/settings/store";
import { Segmented, type SegmentedOption } from "~ui/components/Segmented";
import { Rule } from "./Rule";

type Level = "off" | Intensity;

const LEVELS: SegmentedOption<Level>[] = [
  { value: "off", label: "Off" },
  { value: "low", label: "Light" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "Strong" },
  { value: "max", label: "Max" }
];

/** The one control that matters most, directly under the text it changes. */
export function Anchors() {
  const bionic = useSettings((s) => s.effective.bionic);
  const patch = useSettings((s) => s.patchActiveBionic);
  const level: Level = bionic.enabled ? bionic.intensity : "off";
  return (
    <Rule kicker="Word anchors">
      <Segmented<Level>
        label="Word anchor strength"
        value={level}
        options={LEVELS}
        onChange={(next) => void patch(next === "off" ? { enabled: false } : { enabled: true, intensity: next })}
      />
    </Rule>
  );
}
