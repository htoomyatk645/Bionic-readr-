import { useEffect, useState } from "react";
import { clearReadingMemory, countReadingMemory } from "~features/memory";
import { useSettings } from "~features/settings/store";
import type { RadarIntensity, SkimLayer, Theme } from "~features/settings/types";
import { Disclosure, Field } from "~ui/components/Disclosure";
import {
  MonitorIcon,
  MoonIcon,
  PaletteIcon,
  RadarIcon,
  SpacingIcon,
  SparkIcon,
  SunIcon
} from "~ui/components/Icons";
import { Segmented, type SegmentedOption } from "~ui/components/Segmented";
import { Slider } from "~ui/components/Slider";
import { Switch } from "~ui/components/Switch";

type Section = "focus" | "spacing" | "smart" | "look";

const RADAR: SegmentedOption<RadarIntensity>[] = [
  { value: "subtle", label: "Subtle" },
  { value: "medium", label: "Medium" },
  { value: "pronounced", label: "Strong" }
];
const RADAR_LABEL: Record<RadarIntensity, string> = { subtle: "subtle", medium: "medium", pronounced: "strong" };

const SKIM: SegmentedOption<SkimLayer>[] = [
  { value: "full", label: "Everything" },
  { value: "key", label: "Key points" },
  { value: "headlines", label: "Outline" }
];
const SKIM_HINT: Record<SkimLayer, string> = {
  full: "All text at full strength.",
  key: "Dims everything but lead and key sentences.",
  headlines: "Hides body text so you can scan the structure."
};

const THEMES: SegmentedOption<Theme>[] = [
  { value: "system", label: "Auto", icon: <MonitorIcon /> },
  { value: "light", label: "Light", icon: <SunIcon /> },
  { value: "dark", label: "Dark", icon: <MoonIcon /> }
];
const THEME_LABEL: Record<Theme, string> = { system: "Matches your system", light: "Light", dark: "Dark" };

/**
 * Everything beyond the essentials, folded into four rows. Only one opens at a
 * time so working memory holds a single topic, and each closed row still shows
 * its current state.
 */
export function FineTune() {
  const [open, setOpen] = useState<Section | null>(null);
  const toggle = (s: Section) => setOpen((cur) => (cur === s ? null : s));

  return (
    <section className="space-y-2.5">
      <h3 className="px-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-fg-subtle">
        Fine-tune
      </h3>
      <div className="divide-y divide-line overflow-hidden rounded-[16px] border border-line bg-surface shadow-card">
        <FocusSection open={open === "focus"} onToggle={() => toggle("focus")} />
        <SpacingSection open={open === "spacing"} onToggle={() => toggle("spacing")} />
        <SmartSection open={open === "smart"} onToggle={() => toggle("smart")} />
        <LookSection open={open === "look"} onToggle={() => toggle("look")} />
      </div>
    </section>
  );
}

interface SectionProps {
  open: boolean;
  onToggle(): void;
}

function FocusSection(props: SectionProps) {
  const radar = useSettings((s) => s.effective.radar);
  const skim = useSettings((s) => s.effective.skimLayer);
  const patchRadar = useSettings((s) => s.patchActiveRadar);
  const setSkim = useSettings((s) => s.setActiveSkimLayer);

  const summary = [
    radar.enabled ? `Highlights ${RADAR_LABEL[radar.intensity]}` : "Highlights off",
    SKIM.find((o) => o.value === skim)?.label
  ].join(" · ");

  return (
    <Disclosure title="Highlights & skimming" summary={summary} icon={RadarIcon} {...props}>
      <Field label="Highlight key sentences" hint="A soft underline where the meaning is densest." inline>
        <Switch
          label="Highlight key sentences"
          checked={radar.enabled}
          onChange={(enabled) => void patchRadar({ enabled })}
        />
      </Field>
      {radar.enabled && (
        <Segmented<RadarIntensity>
          label="Highlight strength"
          value={radar.intensity}
          options={RADAR}
          onChange={(intensity) => void patchRadar({ intensity })}
        />
      )}
      <Field label="Show" hint={SKIM_HINT[skim]}>
        <Segmented<SkimLayer> label="Skim layer" value={skim} options={SKIM} onChange={(l) => void setSkim(l)} />
      </Field>
    </Disclosure>
  );
}

function SpacingSection(props: SectionProps) {
  const t = useSettings((s) => s.effective.typography);
  const bionic = useSettings((s) => s.effective.bionic);
  const patchType = useSettings((s) => s.patchActiveTypography);
  const patchBionic = useSettings((s) => s.patchActiveBionic);

  const summary = `Lines ${t.lineHeight.toFixed(1)}× · Paragraphs ${t.paragraphSpacing.toFixed(1)} em`;

  return (
    <Disclosure title="Text & spacing" summary={summary} icon={SpacingIcon} {...props}>
      {bionic.enabled && (
        <Slider
          label="Anchor length"
          min={0.6}
          max={1.4}
          step={0.05}
          value={bionic.fixationStrength}
          onChange={(fixationStrength) => void patchBionic({ fixationStrength })}
          format={(v) => `${Math.round(v * 100)}%`}
          ends={["Shorter", "Longer"]}
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
        ends={["Compact", "Airy"]}
      />
      <Slider
        label="Letter spacing"
        min={-0.01}
        max={0.04}
        step={0.005}
        value={t.letterSpacing}
        onChange={(letterSpacing) => void patchType({ letterSpacing })}
        format={(v) => (v === 0 ? "Normal" : `${v > 0 ? "+" : ""}${v.toFixed(3)} em`)}
        ends={["Tight", "Wide"]}
      />
      <Slider
        label="Paragraph gap"
        min={0.5}
        max={2}
        step={0.1}
        value={t.paragraphSpacing}
        onChange={(paragraphSpacing) => void patchType({ paragraphSpacing })}
        format={(v) => `${v.toFixed(1)} em`}
        ends={["Close", "Open"]}
      />
    </Disclosure>
  );
}

function SmartSection(props: SectionProps) {
  const adaptive = useSettings((s) => s.settings.adaptive);
  const memory = useSettings((s) => s.settings.memory);
  const patchAdaptive = useSettings((s) => s.patchAdaptive);
  const patchMemory = useSettings((s) => s.patchMemory);
  const [count, setCount] = useState<number | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    let alive = true;
    void countReadingMemory().then((n) => alive && setCount(n));
    return () => {
      alive = false;
    };
  }, []);

  const on = [adaptive.enabled && "Adapts to you", memory.enabled && "Remembers your place"].filter(Boolean);
  const summary = on.length ? on.join(" · ") : "Off";

  const clear = async () => {
    await clearReadingMemory();
    setCount(0);
    setConfirming(false);
  };

  return (
    <Disclosure title="Smart reading" summary={summary} icon={SparkIcon} {...props}>
      <Field label="Adapt to my pace" hint="Learns your rhythm and tunes emphasis quietly." inline>
        <Switch
          label="Adapt to my pace"
          checked={adaptive.enabled}
          onChange={(enabled) => void patchAdaptive({ enabled })}
        />
      </Field>
      {adaptive.enabled && (
        <Field label="Ease dense passages" hint="Adds breathing room where you slow down." inline>
          <Switch
            label="Ease dense passages"
            checked={adaptive.frictionRelief}
            onChange={(frictionRelief) => void patchAdaptive({ frictionRelief })}
          />
        </Field>
      )}
      <div className="h-px bg-line" />
      <Field label="Remember my place" hint="Saves where you stopped on each page." inline>
        <Switch
          label="Remember my place"
          checked={memory.enabled}
          onChange={(enabled) => void patchMemory({ enabled })}
        />
      </Field>
      {memory.enabled && (
        <Field label="Offer to resume" hint="A small hint when you come back." inline>
          <Switch
            label="Offer to resume"
            checked={memory.showWarmup}
            onChange={(showWarmup) => void patchMemory({ showWarmup })}
          />
        </Field>
      )}
      <div className="flex items-center justify-between gap-3 rounded-[10px] bg-surface-2 px-3 py-2">
        <span className="text-[12px] text-fg-muted">
          {count === null
            ? "…"
            : count === 0
              ? "No pages saved · on this device only"
              : `${count} page${count === 1 ? "" : "s"} saved · on this device only`}
        </span>
        {confirming ? (
          <span className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="h-7 rounded-[8px] px-2 text-[12px] font-medium text-fg-muted hover:text-fg"
            >
              Keep
            </button>
            <button
              type="button"
              onClick={() => void clear()}
              className="h-7 rounded-[8px] bg-danger px-2.5 text-[12px] font-semibold text-white hover:opacity-90"
            >
              Clear
            </button>
          </span>
        ) : (
          <button
            type="button"
            disabled={!count}
            onClick={() => setConfirming(true)}
            className="h-7 shrink-0 rounded-[8px] px-2 text-[12px] font-medium text-fg-muted hover:text-danger disabled:cursor-not-allowed disabled:opacity-40"
          >
            Clear
          </button>
        )}
      </div>
    </Disclosure>
  );
}

function LookSection(props: SectionProps) {
  const theme = useSettings((s) => s.settings.theme);
  const setTheme = useSettings((s) => s.setTheme);
  return (
    <Disclosure title="Panel appearance" summary={THEME_LABEL[theme]} icon={PaletteIcon} {...props}>
      <Segmented<Theme> label="Panel theme" value={theme} options={THEMES} onChange={(t) => void setTheme(t)} />
    </Disclosure>
  );
}
