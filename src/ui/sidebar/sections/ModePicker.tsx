import type { ComponentType, SVGProps } from "react";
import { MODE_META } from "~features/modes";
import { useSettings } from "~features/settings/store";
import type { ModeId } from "~features/settings/types";
import { DeepIcon, FlowIcon, FocusIcon, ResetIcon, StudyIcon } from "~ui/components/Icons";

const ICONS: Record<ModeId, ComponentType<SVGProps<SVGSVGElement>>> = {
  focus: FocusIcon,
  flow: FlowIcon,
  study: StudyIcon,
  deep: DeepIcon
};

export function ModePicker() {
  const current = useSettings((s) => s.settings.modes.current);
  const customizations = useSettings((s) => s.settings.modes.customizations);
  const setMode = useSettings((s) => s.setMode);
  const resetActiveMode = useSettings((s) => s.resetActiveMode);
  const customized = Object.keys(customizations[current] ?? {}).length > 0;

  return (
    <section className="space-y-2">
      <div className="flex items-end justify-between px-1">
        <h3 className="text-[12px] font-semibold text-fg">Reading mode</h3>
        {customized && (
          <button
            type="button"
            onClick={() => void resetActiveMode()}
            className="inline-flex items-center gap-1 rounded-[6px] px-1.5 py-0.5 text-[12px] text-fg-muted hover:bg-surface-2 hover:text-fg"
          >
            <ResetIcon /> Reset to preset
          </button>
        )}
      </div>
      <div role="radiogroup" aria-label="Reading mode" className="grid grid-cols-2 gap-2">
        {MODE_META.map((m) => {
          const active = m.id === current;
          const Icon = ICONS[m.id];
          const tweaked = Object.keys(customizations[m.id] ?? {}).length > 0;
          return (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => void setMode(m.id)}
              className={
                "group relative flex flex-col items-start gap-1.5 rounded-[12px] border p-3 text-left transition-[border-color,background-color,box-shadow] duration-150 " +
                (active
                  ? "border-accent bg-accent-soft shadow-[0_0_0_1px_rgb(var(--br-accent))]"
                  : "border-line bg-surface shadow-card hover:border-fg-subtle/60")
              }
            >
              <span
                className={
                  "grid h-7 w-7 place-items-center rounded-[8px] " +
                  (active ? "bg-accent text-accent-fg" : "bg-surface-2 text-fg-muted")
                }
              >
                <Icon />
              </span>
              <span className="text-[13px] font-semibold text-fg">
                {m.label}
                {tweaked && (
                  <span
                    title="Customized"
                    className="ml-1.5 inline-block h-1.5 w-1.5 -translate-y-[2px] rounded-full bg-accent"
                  />
                )}
              </span>
              <span className="text-[11.5px] leading-snug text-fg-muted">{m.tagline}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
