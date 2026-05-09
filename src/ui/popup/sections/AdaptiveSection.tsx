import { Row } from "~ui/components/Row";
import { Section } from "~ui/components/Section";
import { Switch } from "~ui/components/Switch";
import { useSettings } from "~features/settings/store";

export function AdaptiveSection() {
  const adaptive = useSettings((s) => s.settings.adaptive);
  const patch = useSettings((s) => s.patchAdaptive);

  return (
    <Section title="Adaptive presence" hint="Reads your reading rhythm. Stays out of your way.">
      <Row label="Adapt subtly to my pace">
        <Switch
          checked={adaptive.enabled}
          onChange={(enabled) =>
            patch({ enabled, frictionRelief: enabled ? adaptive.frictionRelief : false })
          }
        />
      </Row>
      {adaptive.enabled && (
        <Row label="Relieve friction on dense passages">
          <Switch
            checked={adaptive.frictionRelief}
            onChange={(frictionRelief) => patch({ frictionRelief })}
          />
        </Row>
      )}
    </Section>
  );
}
