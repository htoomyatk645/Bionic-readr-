import { Section } from "~ui/components/Section";
import { Slider } from "~ui/components/Slider";
import { useSettings } from "~features/settings/store";

export function TypographySection() {
  const typography = useSettings((s) => s.effective.typography);
  const patch = useSettings((s) => s.patchActiveTypography);

  return (
    <Section title="Typography" hint="Subtle adjustments to ease the eye.">
      <Slider
        label="Line height"
        min={1.3}
        max={2}
        step={0.05}
        value={typography.lineHeight}
        onChange={(lineHeight) => patch({ lineHeight })}
        format={(v) => v.toFixed(2)}
      />
      <Slider
        label="Letter spacing"
        min={-0.01}
        max={0.04}
        step={0.005}
        value={typography.letterSpacing}
        onChange={(letterSpacing) => patch({ letterSpacing })}
        format={(v) => `${v >= 0 ? "+" : ""}${v.toFixed(3)}em`}
      />
    </Section>
  );
}
