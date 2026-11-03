import { useSettings } from "~features/settings/store";
import { Group, Row } from "~ui/components/Group";
import { Switch } from "~ui/components/Switch";

export function AdaptiveGroup() {
  const adaptive = useSettings((s) => s.settings.adaptive);
  const patch = useSettings((s) => s.patchAdaptive);

  return (
    <Group title="Adaptive" description="Learns your rhythm on-device and adjusts quietly.">
      <Row label="Adapt to my pace" description="Tunes emphasis and spacing as you read.">
        <Switch
          label="Adapt to my pace"
          checked={adaptive.enabled}
          onChange={(enabled) => void patch({ enabled })}
        />
      </Row>
      <Row label="Ease dense passages" description="Adds breathing room where you slow down.">
        <Switch
          label="Ease dense passages"
          checked={adaptive.enabled && adaptive.frictionRelief}
          disabled={!adaptive.enabled}
          onChange={(frictionRelief) => void patch({ frictionRelief })}
        />
      </Row>
    </Group>
  );
}
