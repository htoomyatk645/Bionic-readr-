import { MODE_META } from "~features/modes";
import { useSettings } from "~features/settings/store";
import type { ModeId } from "~features/settings/types";
import { ResetIcon } from "~ui/components/Icons";
import { Rule } from "./Rule";

/** Modes set like a table of contents: the name, and what it's for. */
export function Modes() {
  const current = useSettings((s) => s.settings.modes.current);
  const customizations = useSettings((s) => s.settings.modes.customizations);
  const setMode = useSettings((s) => s.setMode);
  const resetActiveMode = useSettings((s) => s.resetActiveMode);
  const customized = Object.keys(customizations[current] ?? {}).length > 0;

  const move = (delta: number) => {
    const i = MODE_META.findIndex((m) => m.id === current);
    void setMode(MODE_META[(i + delta + MODE_META.length) % MODE_META.length].id as ModeId);
  };

  return (
    <Rule
      kicker="Mode"
      aside={
        customized && (
          <button
            type="button"
            onClick={() => void resetActiveMode()}
            className="inline-flex items-center gap-1 text-[12px] text-fg-subtle hover:text-fg"
          >
            <ResetIcon /> Undo my changes
          </button>
        )
      }
    >
      <div
        role="radiogroup"
        aria-label="Reading mode"
        className="-my-1"
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowRight") {
            e.preventDefault();
            move(1);
          } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
            e.preventDefault();
            move(-1);
          }
        }}
      >
        {MODE_META.map((m, i) => {
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
              className="group flex w-full items-baseline gap-3 py-1.5 text-left"
            >
              <span className="w-4 shrink-0 text-[11px] tabular-nums text-fg-subtle">{i + 1}</span>
              <span
                className={
                  "br-serif rounded-[2px] text-[21px] leading-tight transition-colors " +
                  (on ? "br-mark text-fg" : "text-fg-subtle group-hover:text-fg-muted")
                }
              >
                {m.label}
                {tweaked && <sup className="ml-0.5 text-[11px] text-fg-subtle">*</sup>}
              </span>
              <span
                className={
                  "br-serif min-w-0 flex-1 truncate text-right text-[13px] italic transition-opacity " +
                  (on ? "text-fg-muted opacity-100" : "text-fg-subtle opacity-0 group-hover:opacity-100")
                }
              >
                {m.tagline.replace(/\.$/, "")}
              </span>
            </button>
          );
        })}
      </div>
    </Rule>
  );
}
