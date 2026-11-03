import { useSettings } from "~features/settings/store";
import type { Theme } from "~features/settings/types";
import { Group, Row } from "~ui/components/Group";
import { MonitorIcon, MoonIcon, SunIcon } from "~ui/components/Icons";
import { Segmented, type SegmentedOption } from "~ui/components/Segmented";

const THEMES: SegmentedOption<Theme>[] = [
  { value: "system", label: "System", icon: <MonitorIcon /> },
  { value: "light", label: "Light", icon: <SunIcon /> },
  { value: "dark", label: "Dark", icon: <MoonIcon /> }
];

export function AppearanceGroup() {
  const theme = useSettings((s) => s.settings.theme);
  const setTheme = useSettings((s) => s.setTheme);
  return (
    <Group title="Appearance">
      <Row label="Panel theme" stacked>
        <Segmented<Theme> label="Panel theme" value={theme} options={THEMES} onChange={(t) => void setTheme(t)} />
      </Row>
    </Group>
  );
}
