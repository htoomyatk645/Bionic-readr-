import type { ReactNode } from "react";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

interface SegmentedProps<T extends string> {
  value: T;
  options: SegmentedOption<T>[];
  onChange(next: T): void;
  label: string;
}

/**
 * Choices set as a line of words; the chosen one is marked with the
 * highlighter. Radio-group semantics, arrow-key navigable.
 */
export function Segmented<T extends string>({ value, options, onChange, label }: SegmentedProps<T>) {
  const index = options.findIndex((o) => o.value === value);
  const move = (delta: number) => {
    const next = options[(index + delta + options.length) % options.length];
    onChange(next.value);
  };
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex flex-wrap items-baseline gap-x-4 gap-y-1"
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
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(opt.value)}
            className={
              "inline-flex items-center gap-1 rounded-[2px] py-0.5 text-[13.5px] transition-colors duration-150 " +
              (active ? "br-mark font-semibold text-fg" : "text-fg-subtle hover:text-fg")
            }
          >
            {opt.icon}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
