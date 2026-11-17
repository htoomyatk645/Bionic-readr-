import { MODE_META } from "~features/modes";
import { useSettings } from "~features/settings/store";
import type { ModeId } from "~features/settings/types";

export function ModePills() {
  const current = useSettings((s) => s.settings.modes.current);
  const customizations = useSettings((s) => s.settings.modes.customizations);
  const setMode = useSettings((s) => s.setMode);
  const active = MODE_META.find((m) => m.id === current);

  const move = (delta: number) => {
    const i = MODE_META.findIndex((m) => m.id === current);
    void setMode(MODE_META[(i + delta + MODE_META.length) % MODE_META.length].id as ModeId);
  };

  return (
    <section>
      <h3 className="mb-2.5 text-[13px] font-medium text-fg-muted">Mode</h3>
      <div
        role="radiogroup"
        aria-label="Reading mode"
        className="flex flex-wrap gap-2"
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
          const tweaked = Object.keys(customizations[m.id] ?? {}).length > 0;
          return (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={on}
              tabIndex={on ? 0 : -1}
              onClick={() => void setMode(m.id)}
              className={
                "relative h-[38px] rounded-full px-4 text-[14.5px] font-medium transition-colors " +
                (on ? "bg-fg text-bg" : "bg-surface-2 text-fg hover:bg-[var(--br-track)]")
              }
            >
              {m.label}
              {tweaked && (
                <span
                  title="Customized"
                  className={"ml-1.5 inline-block h-1.5 w-1.5 -translate-y-[2px] rounded-full " + (on ? "bg-bg/70" : "bg-accent")}
                />
              )}
            </button>
          );
        })}
      </div>
      <p aria-live="polite" className="mt-2.5 text-[13.5px] text-fg-muted">
        {active?.tagline}
      </p>
    </section>
  );
}
