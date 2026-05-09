import { useEffect } from "react";
import { motion } from "framer-motion";
import { Preview } from "~ui/components/Preview";
import { Row } from "~ui/components/Row";
import { Section } from "~ui/components/Section";
import { Segmented, type SegmentedOption } from "~ui/components/Segmented";
import { Slider } from "~ui/components/Slider";
import { Switch } from "~ui/components/Switch";
import { useActiveHost } from "~ui/hooks/useActiveHost";
import { useSettings } from "~features/settings/store";
import type { Intensity } from "~core/bionic/types";

const INTENSITY_OPTIONS: SegmentedOption<Intensity>[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "max", label: "Max" }
];

export function Popup() {
  const { settings, hydrated, hydrate, patchBionic, patchTypography, toggleHostExcluded, reset } =
    useSettings();
  const host = useActiveHost();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const isHostExcluded = host ? settings.excludedHosts.includes(host) : false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="surface w-[360px] font-sans"
    >
      <header className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[15px] font-semibold tracking-tight">
              Bionic <span className="text-accent">Redr</span>
            </div>
            <div className="text-[11px] text-ink-400 mt-0.5">
              Attention optimizer · {hydrated ? "ready" : "…"}
            </div>
          </div>
          <Switch
            checked={settings.bionic.enabled}
            onChange={(v) => patchBionic({ enabled: v })}
            label="Enable Bionic Redr"
          />
        </div>
      </header>

      <div className="px-5">
        <Preview settings={settings.bionic} />
      </div>

      <div className="mt-2">
        <Section title="Reading">
          <div className="space-y-2">
            <div className="text-[12px] text-ink-500 dark:text-ink-300">Intensity</div>
            <Segmented<Intensity>
              value={settings.bionic.intensity}
              options={INTENSITY_OPTIONS}
              onChange={(intensity) => patchBionic({ intensity })}
            />
          </div>
          <Slider
            label="Fixation strength"
            min={0.6}
            max={1.4}
            step={0.05}
            value={settings.bionic.fixationStrength}
            onChange={(fixationStrength) => patchBionic({ fixationStrength })}
            format={(v) => `${Math.round(v * 100)}%`}
          />
        </Section>

        <Section title="Typography" hint="Subtle adjustments to ease the eye.">
          <Slider
            label="Line height"
            min={1.3}
            max={2}
            step={0.05}
            value={settings.typography.lineHeight}
            onChange={(lineHeight) => patchTypography({ lineHeight })}
            format={(v) => v.toFixed(2)}
          />
          <Slider
            label="Letter spacing"
            min={-0.01}
            max={0.04}
            step={0.005}
            value={settings.typography.letterSpacing}
            onChange={(letterSpacing) => patchTypography({ letterSpacing })}
            format={(v) => `${v >= 0 ? "+" : ""}${v.toFixed(3)}em`}
          />
        </Section>

        <Section title="This site">
          <Row label={host ?? "Current site"} hint={isHostExcluded ? "Paused here" : "Active here"}>
            <Switch
              checked={!isHostExcluded}
              onChange={() => host && toggleHostExcluded(host)}
              label="Toggle on this site"
            />
          </Row>
        </Section>
      </div>

      <footer className="px-5 py-3 flex items-center justify-between text-[11px] text-ink-400">
        <span>v0.1 · Phase 1</span>
        <button
          type="button"
          onClick={() => reset()}
          className="hover:text-ink-700 dark:hover:text-ink-200 transition-colors"
        >
          Reset
        </button>
      </footer>
    </motion.div>
  );
}
