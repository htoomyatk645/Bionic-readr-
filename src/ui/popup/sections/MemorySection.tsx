import { Row } from "~ui/components/Row";
import { Section } from "~ui/components/Section";
import { Switch } from "~ui/components/Switch";
import { useSettings } from "~features/settings/store";

export function MemorySection() {
  const memory = useSettings((s) => s.settings.memory);
  const patch = useSettings((s) => s.patchMemory);

  return (
    <Section title="Continuity" hint="Local-only. Lives on this device.">
      <Row label="Remember where I left off">
        <Switch
          checked={memory.enabled}
          onChange={(enabled) =>
            patch({ enabled, showWarmup: enabled ? memory.showWarmup : false })
          }
        />
      </Row>
      {memory.enabled && (
        <Row label="Show warmup hint on revisit">
          <Switch
            checked={memory.showWarmup}
            onChange={(showWarmup) => patch({ showWarmup })}
          />
        </Row>
      )}
    </Section>
  );
}
