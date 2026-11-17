import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { MODE_PRESETS } from "~features/modes";
import { clearReadingMemory, countReadingMemory } from "~features/memory";
import { useSettings } from "~features/settings/store";
import type { RadarIntensity, Theme } from "~features/settings/types";
import { Segmented, type SegmentedOption } from "~ui/components/Segmented";
import { Slider } from "~ui/components/Slider";
import { Switch } from "~ui/components/Switch";
import { Group, Row } from "./Grouped";

const RADAR: SegmentedOption<RadarIntensity>[] = [
  { value: "subtle", label: "Subtle" },
  { value: "medium", label: "Medium" },
  { value: "pronounced", label: "Strong" }
];

const THEMES: SegmentedOption<Theme>[] = [
  { value: "system", label: "Automatic" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" }
];

/** Everything beyond the essentials, in an iOS-style sheet. */
export function MoreSheet({ onClose }: { onClose(): void }) {
  const reduceMotion = useReducedMotion();
  const sheetRef = useRef<HTMLDivElement>(null);

  const settings = useSettings((s) => s.settings);
  const effective = useSettings((s) => s.effective);
  const patchBionic = useSettings((s) => s.patchActiveBionic);
  const patchType = useSettings((s) => s.patchActiveTypography);
  const patchRadar = useSettings((s) => s.patchActiveRadar);
  const patchAdaptive = useSettings((s) => s.patchAdaptive);
  const patchMemory = useSettings((s) => s.patchMemory);
  const setTheme = useSettings((s) => s.setTheme);
  const resetActiveMode = useSettings((s) => s.resetActiveMode);

  const [count, setCount] = useState<number | null>(null);
  const [confirming, setConfirming] = useState(false);

  const mode = settings.modes.current;
  const modeLabel = MODE_PRESETS[mode].label;
  const customized = Object.keys(settings.modes.customizations[mode] ?? {}).length > 0;
  const { bionic, typography: t, radar } = effective;
  const { adaptive, memory } = settings;

  useEffect(() => {
    let alive = true;
    void countReadingMemory().then((n) => alive && setCount(n));
    sheetRef.current?.focus({ preventScroll: true });
    // Escape closes the sheet before it can close the whole panel.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => {
      alive = false;
      window.removeEventListener("keydown", onKey, true);
    };
  }, [onClose]);

  const clear = async () => {
    await clearReadingMemory();
    setCount(0);
    setConfirming(false);
  };

  const spring = reduceMotion ? { duration: 0 } : { type: "spring" as const, stiffness: 420, damping: 42 };

  return (
    <>
      <motion.div
        aria-hidden
        className="absolute inset-0 z-10 bg-black/25"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.2 }}
        onClick={onClose}
      />
      <motion.div
        ref={sheetRef}
        tabIndex={-1}
        role="dialog"
        aria-label="More settings"
        className="absolute inset-x-0 bottom-0 top-[64px] z-20 flex flex-col rounded-t-[22px] bg-grouped shadow-[0_-8px_30px_rgba(0,0,0,0.12)] outline-none"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={spring}
      >
        <div className="flex shrink-0 flex-col px-4 pt-2">
          <div aria-hidden className="mx-auto h-[5px] w-9 rounded-full bg-fg-subtle/40" />
          <div className="mt-3 flex items-center justify-between">
            <h2 className="text-[20px] font-bold tracking-[-0.02em] text-fg">More Settings</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-[8px] px-1.5 py-1 text-[16px] font-semibold text-accent hover:opacity-80"
            >
              Done
            </button>
          </div>
        </div>

        <div className="br-scroll min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-4 pb-8 pt-4">
          <Group header="Text" footer={`These apply to ${modeLabel} mode.`}>
            {bionic.enabled && (
              <Slider
                label="Anchor length"
                min={0.6}
                max={1.4}
                step={0.05}
                value={bionic.fixationStrength}
                onChange={(fixationStrength) => void patchBionic({ fixationStrength })}
                format={(v) => `${Math.round(v * 100)}%`}
              />
            )}
            <Slider
              label="Line spacing"
              min={1.3}
              max={2}
              step={0.05}
              value={t.lineHeight}
              onChange={(lineHeight) => void patchType({ lineHeight })}
              format={(v) => `${v.toFixed(2)}×`}
            />
            <Slider
              label="Letter spacing"
              min={-0.01}
              max={0.04}
              step={0.005}
              value={t.letterSpacing}
              onChange={(letterSpacing) => void patchType({ letterSpacing })}
              format={(v) => (v === 0 ? "Default" : `${v > 0 ? "+" : ""}${(v * 100).toFixed(1)}%`)}
            />
            <Slider
              label="Paragraph spacing"
              min={0.5}
              max={2}
              step={0.1}
              value={t.paragraphSpacing}
              onChange={(paragraphSpacing) => void patchType({ paragraphSpacing })}
              format={(v) => `${v.toFixed(1)}×`}
            />
          </Group>

          <Group header="Highlights" footer="A soft underline marks the sentences that carry the most meaning.">
            <Row label="Highlight key sentences">
              <Switch
                label="Highlight key sentences"
                checked={radar.enabled}
                onChange={(enabled) => void patchRadar({ enabled })}
              />
            </Row>
            {radar.enabled && (
              <div className="px-4 py-2.5">
                <Segmented<RadarIntensity>
                  label="Highlight strength"
                  value={radar.intensity}
                  options={RADAR}
                  onChange={(intensity) => void patchRadar({ intensity })}
                />
              </div>
            )}
          </Group>

          <Group header="Smart reading" footer="Learns your reading rhythm on this device and adjusts quietly.">
            <Row label="Adapt to my pace">
              <Switch
                label="Adapt to my pace"
                checked={adaptive.enabled}
                onChange={(enabled) => void patchAdaptive({ enabled })}
              />
            </Row>
            {adaptive.enabled && (
              <Row label="Ease dense passages">
                <Switch
                  label="Ease dense passages"
                  checked={adaptive.frictionRelief}
                  onChange={(frictionRelief) => void patchAdaptive({ frictionRelief })}
                />
              </Row>
            )}
          </Group>

          <Group
            header="Reading memory"
            footer={
              count === null
                ? "Stored only on this device."
                : `${count === 0 ? "No pages" : count === 1 ? "1 page" : `${count} pages`} remembered. Stored only on this device.`
            }
          >
            <Row label="Remember my place">
              <Switch
                label="Remember my place"
                checked={memory.enabled}
                onChange={(enabled) => void patchMemory({ enabled })}
              />
            </Row>
            {memory.enabled && (
              <Row label="Offer to resume">
                <Switch
                  label="Offer to resume"
                  checked={memory.showWarmup}
                  onChange={(showWarmup) => void patchMemory({ showWarmup })}
                />
              </Row>
            )}
            {confirming ? (
              <div className="flex min-h-[48px] items-center justify-between px-4">
                <button type="button" onClick={() => void clear()} className="font-semibold text-danger">
                  Clear {count === 1 ? "1 Page" : `${count} Pages`}
                </button>
                <button type="button" onClick={() => setConfirming(false)} className="text-accent">
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={!count}
                onClick={() => setConfirming(true)}
                className="flex min-h-[48px] w-full items-center px-4 text-left text-danger disabled:text-fg-subtle"
              >
                Clear Reading History…
              </button>
            )}
          </Group>

          <Group header="Appearance">
            <div className="px-4 py-2.5">
              <Segmented<Theme> label="Panel appearance" value={settings.theme} options={THEMES} onChange={(v) => void setTheme(v)} />
            </div>
          </Group>

          {customized && (
            <Group footer={`Puts ${modeLabel} back to how it was designed.`}>
              <button
                type="button"
                onClick={() => void resetActiveMode()}
                className="flex min-h-[48px] w-full items-center px-4 text-left text-accent"
              >
                Reset {modeLabel} to Default
              </button>
            </Group>
          )}
        </div>
      </motion.div>
    </>
  );
}
