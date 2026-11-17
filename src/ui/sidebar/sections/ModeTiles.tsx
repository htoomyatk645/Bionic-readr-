import type { Intensity } from "~core/bionic/types";
import { MODE_META, MODE_PRESETS } from "~features/modes";
import { useSettings } from "~features/settings/store";
import type { ModeId } from "~features/settings/types";

// The tile glyph is a tiny rendering of the mode itself: heavier anchors and
// looser lines for deeper modes. You pick by seeing, not by reading copy.
const WEIGHT: Record<Intensity, number> = { low: 560, medium: 680, high: 780, max: 880 };

export function ModeTiles() {
  const current = useSettings((s) => s.settings.modes.current);
  const customizations = useSettings((s) => s.settings.modes.customizations);
  const setMode = useSettings((s) => s.setMode);
  const active = MODE_META.find((m) => m.id === current);

  const move = (delta: number) => {
    const i = MODE_META.findIndex((m) => m.id === current);
    const next = MODE_META[(i + delta + MODE_META.length) % MODE_META.length];
    void setMode(next.id as ModeId);
  };

  return (
    <section className="space-y-2.5">
      <div className="flex items-baseline justify-between px-1">
        <h3 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-fg-subtle">Mode</h3>
        <p aria-live="polite" className="truncate pl-3 text-[12px] text-fg-muted">
          {active?.tagline}
        </p>
      </div>
      <div
        role="radiogroup"
        aria-label="Reading mode"
        className="grid grid-cols-4 gap-2"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowDown") {
            e.preventDefault();
            move(1);
          } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
            e.preventDefault();
            move(-1);
          }
        }}
      >
        {MODE_META.map((m) => {
          const on = m.id === current;
          const preset = MODE_PRESETS[m.id];
          const tweaked = Object.keys(customizations[m.id] ?? {}).length > 0;
          return (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={`${m.label}: ${m.tagline}`}
              tabIndex={on ? 0 : -1}
              onClick={() => void setMode(m.id)}
              className={
                "relative flex flex-col items-center gap-1.5 rounded-[12px] border px-1 pb-2 pt-3 transition-[border-color,background-color,box-shadow] duration-150 " +
                (on
                  ? "border-accent bg-accent-soft shadow-[0_0_0_1px_rgb(var(--br-accent))]"
                  : "border-line bg-surface hover:border-fg-subtle/50")
              }
            >
              <span aria-hidden className="br-sample text-[20px] leading-none text-fg-muted">
                <span className="text-fg" style={{ fontWeight: WEIGHT[preset.bionic.intensity] }}>
                  Re
                </span>
                ad
              </span>
              <span
                aria-hidden
                className="flex w-8 flex-col"
                style={{ gap: `${Math.round((preset.typography.lineHeight - 1.2) * 6)}px` }}
              >
                <span className={"h-[2px] rounded-full " + (on ? "bg-accent/60" : "bg-line")} />
                <span className={"h-[2px] w-3/4 rounded-full " + (on ? "bg-accent/60" : "bg-line")} />
              </span>
              <span className={"text-[12px] font-medium " + (on ? "text-fg" : "text-fg-muted")}>
                {m.label}
              </span>
              {tweaked && (
                <span
                  title="Customized"
                  className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent"
                />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
