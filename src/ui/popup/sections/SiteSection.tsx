import { Row } from "~ui/components/Row";
import { Section } from "~ui/components/Section";
import { Switch } from "~ui/components/Switch";
import { useActiveHost } from "~ui/hooks/useActiveHost";
import { useSettings } from "~features/settings/store";

export function SiteSection() {
  const host = useActiveHost();
  const excludedHosts = useSettings((s) => s.settings.excludedHosts);
  const toggle = useSettings((s) => s.toggleHostExcluded);
  const isExcluded = host ? excludedHosts.includes(host) : false;

  return (
    <Section title="This site">
      <Row
        label={host ?? "Current site"}
        hint={isExcluded ? "Paused here" : "Active here"}
      >
        <Switch
          checked={!isExcluded}
          onChange={() => host && toggle(host)}
        />
      </Row>
    </Section>
  );
}
