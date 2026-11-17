import type { Intensity } from "~core/bionic/types";
import { useSettings } from "~features/settings/store";
import { Preview } from "~ui/components/Preview";
import { Segmented, type SegmentedOption } from "~ui/components/Segmented";

type Level = "off" | Intensity;

const LEVELS: SegmentedOption<Level>[] = [
  { value: "off", label: "Off" },
  { value: "low", label: "Light" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "Strong" },
  { value: "max", label: "Max" }
];

/**
 * The hero: live sample text with the single most important control directly
 * under it. Cause and effect sit in the same place, so the reader tunes by
 * looking at text, not by interpreting labels.
 */
export function ReaderCard({ paused }: { paused: boolean }) {
  const bionic = useSettings((s) => s.effective.bionic);
  const typography = useSettings((s) => s.effective.typography);
  const patch = useSettings((s) => s.patchActiveBionic);
  const level: Level = bionic.enabled ? bionic.intensity : "off";

  return (
    <section className="rounded-[16px] border border-line bg-surface p-4 shadow-card">
      <Preview bionic={bionic} typography={typography} dimmed={paused} />
      <div className="mt-4 space-y-2">
        <div className="flex items-baseline justify-between px-0.5">
          <span id="br-emphasis-label" className="text-[12px] font-medium text-fg-muted">
            Word anchors
          </span>
          <span className="text-[11.5px] text-fg-subtle">
            {bionic.enabled ? "Bolds the start of each word" : "Text left as-is"}
          </span>
        </div>
        <Segmented<Level>
          label="Word anchor strength"
          value={level}
          options={LEVELS}
          onChange={(next) =>
            void patch(next === "off" ? { enabled: false } : { enabled: true, intensity: next })
          }
        />
      </div>
    </section>
  );
}
