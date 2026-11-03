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

/** Pill segmented control (radio group semantics, arrow-key navigable). */
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
      className="grid w-full gap-0.5 rounded-[10px] bg-surface-2 p-[3px]"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
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
              "flex h-[28px] items-center justify-center gap-1.5 rounded-[8px] px-2 text-[12px] font-medium transition-[background-color,color,box-shadow] duration-150 " +
              (active
                ? "bg-surface text-fg shadow-[0_1px_2px_rgba(0,0,0,0.12)]"
                : "text-fg-muted hover:text-fg")
            }
          >
            {opt.icon}
            <span className="truncate">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
