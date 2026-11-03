import { useSettings } from "~features/settings/store";
import { Group } from "~ui/components/Group";
import { Slider } from "~ui/components/Slider";

export function TypographyGroup() {
  const typography = useSettings((s) => s.effective.typography);
  const patch = useSettings((s) => s.patchActiveTypography);

  return (
    <Group title="Typography" description="Give dense text room to breathe.">
      <Slider
        label="Line height"
        min={1.3}
        max={2}
        step={0.05}
        value={typography.lineHeight}
        onChange={(lineHeight) => void patch({ lineHeight })}
        format={(v) => v.toFixed(2)}
      />
      <Slider
        label="Letter spacing"
        min={-0.01}
        max={0.04}
        step={0.005}
        value={typography.letterSpacing}
        onChange={(letterSpacing) => void patch({ letterSpacing })}
        format={(v) => `${v >= 0 ? "+" : ""}${v.toFixed(3)} em`}
      />
      <Slider
        label="Paragraph spacing"
        min={0.5}
        max={2}
        step={0.1}
        value={typography.paragraphSpacing}
        onChange={(paragraphSpacing) => void patch({ paragraphSpacing })}
        format={(v) => `${v.toFixed(1)} em`}
      />
    </Group>
  );
}
