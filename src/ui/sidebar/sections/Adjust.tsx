import { useEffect, useState } from "react";
import { clearReadingMemory, countReadingMemory } from "~features/memory";
import { useSettings } from "~features/settings/store";
import type { RadarIntensity, SkimLayer, Theme } from "~features/settings/types";
import { Segmented, type SegmentedOption } from "~ui/components/Segmented";
import { Slider } from "~ui/components/Slider";
import { Switch } from "~ui/components/Switch";
import { Line, Rule } from "./Rule";

type Tab = "spacing" | "focus" | "memory" | "panel";
const TABS: { id: Tab; label: string }[] = [
  { id: "spacing", label: "Spacing" },
  { id: "focus", label: "Focus" },
  { id: "memory", label: "Memory" },
  { id: "panel", label: "Panel" }
];

/**
 * Everything beyond the essentials, behind one line of words. Nothing is open
 * until asked for, and only one topic shows at a time — less on the page,
 * less held in working memory.
 */
export function Adjust() {
  const [tab, setTab] = useState<Tab | null>(null);
  return (
    <Rule kicker="Adjust">
      <div role="tablist" aria-label="More settings" className="flex flex-wrap gap-x-4 gap-y-1">
        {TABS.map((t) => {
          const on = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`br-tab-${t.id}`}
              aria-selected={on}
              aria-controls="br-adjust-panel"
              onClick={() => setTab(on ? null : t.id)}
              className={
                "br-serif rounded-[2px] text-[17px] transition-colors " +
                (on ? "br-mark text-fg" : "text-fg-subtle hover:text-fg")
              }
            >
              {t.label}
            </button>
          );
        })}
      </div>
      {tab && (
        <div
          id="br-adjust-panel"
          role="tabpanel"
          aria-labelledby={`br-tab-${tab}`}
          className="mt-4 space-y-4"
        >
          {tab === "spacing" && <Spacing />}
          {tab === "focus" && <Focus />}
          {tab === "memory" && <Memory />}
          {tab === "panel" && <Panel />}
        </div>
      )}
    </Rule>
  );
}

function Spacing() {
  const t = useSettings((s) => s.effective.typography);
  const bionic = useSettings((s) => s.effective.bionic);
  const patchType = useSettings((s) => s.patchActiveTypography);
  const patchBionic = useSettings((s) => s.patchActiveBionic);
  return (
    <>
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
        format={(v) => (v === 0 ? "normal" : `${v > 0 ? "+" : ""}${v.toFixed(3)} em`)}
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
    </>
  );
}

const RADAR: SegmentedOption<RadarIntensity>[] = [
  { value: "subtle", label: "Subtle" },
  { value: "medium", label: "Medium" },
  { value: "pronounced", label: "Strong" }
];
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

function Focus() {
  const radar = useSettings((s) => s.effective.radar);
  const skim = useSettings((s) => s.effective.skimLayer);
  const patchRadar = useSettings((s) => s.patchActiveRadar);
  const setSkim = useSettings((s) => s.setActiveSkimLayer);
  return (
    <>
      <div>
        <Line label="Underline key sentences" hint="Where the meaning is densest.">
          <Switch
            label="Underline key sentences"
            checked={radar.enabled}
            onChange={(enabled) => void patchRadar({ enabled })}
          />
        </Line>
        {radar.enabled && (
          <div className="mt-1.5">
            <Segmented<RadarIntensity>
              label="Underline strength"
              value={radar.intensity}
              options={RADAR}
              onChange={(intensity) => void patchRadar({ intensity })}
            />
          </div>
        )}
      </div>
      <div>
        <div className="text-[13.5px] text-fg">Show</div>
        <p className="br-serif mb-1.5 mt-0.5 text-[13px] italic text-fg-subtle">{SKIM_HINT[skim]}</p>
        <Segmented<SkimLayer> label="Skim layer" value={skim} options={SKIM} onChange={(l) => void setSkim(l)} />
      </div>
    </>
  );
}

function Memory() {
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

  const clear = async () => {
    await clearReadingMemory();
    setCount(0);
    setConfirming(false);
  };

  return (
    <div className="-my-1.5">
      <Line label="Adapt to my pace" hint="Learns your rhythm and tunes emphasis.">
        <Switch label="Adapt to my pace" checked={adaptive.enabled} onChange={(enabled) => void patchAdaptive({ enabled })} />
      </Line>
      {adaptive.enabled && (
        <Line label="Ease dense passages" hint="More room where you slow down.">
          <Switch
            label="Ease dense passages"
            checked={adaptive.frictionRelief}
            onChange={(frictionRelief) => void patchAdaptive({ frictionRelief })}
          />
        </Line>
      )}
      <Line label="Remember my place" hint="Where you stopped on each page.">
        <Switch label="Remember my place" checked={memory.enabled} onChange={(enabled) => void patchMemory({ enabled })} />
      </Line>
      {memory.enabled && (
        <Line label="Offer to resume" hint="A quiet hint when you come back.">
          <Switch
            label="Offer to resume"
            checked={memory.showWarmup}
            onChange={(showWarmup) => void patchMemory({ showWarmup })}
          />
        </Line>
      )}
      <div className="mt-2 flex items-baseline justify-between gap-3 border-t border-dashed border-line pt-2.5">
        <span className="br-serif text-[13px] italic text-fg-subtle">
          {count === null ? "…" : `${count === 0 ? "No" : count} page${count === 1 ? "" : "s"} saved, on this device only`}
        </span>
        {confirming ? (
          <span className="flex shrink-0 gap-3 text-[13px]">
            <button type="button" onClick={() => setConfirming(false)} className="text-fg-subtle hover:text-fg">
              Keep
            </button>
            <button type="button" onClick={() => void clear()} className="font-semibold text-danger underline underline-offset-2">
              Erase
            </button>
          </span>
        ) : (
          <button
            type="button"
            disabled={!count}
            onClick={() => setConfirming(true)}
            className="shrink-0 text-[13px] text-fg-subtle underline decoration-line underline-offset-2 hover:text-fg disabled:no-underline disabled:opacity-40"
          >
            Erase
          </button>
        )}
      </div>
    </div>
  );
}

const THEMES: SegmentedOption<Theme>[] = [
  { value: "system", label: "Match system" },
  { value: "light", label: "Paper" },
  { value: "dark", label: "Ink" }
];

function Panel() {
  const theme = useSettings((s) => s.settings.theme);
  const setTheme = useSettings((s) => s.setTheme);
  return <Segmented<Theme> label="Panel theme" value={theme} options={THEMES} onChange={(t) => void setTheme(t)} />;
}
