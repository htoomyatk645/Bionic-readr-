import { motion, useReducedMotion } from "framer-motion";
import { useId, type ReactNode } from "react";

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

/** iOS segmented control: a sliding thumb on a grey track. */
export function Segmented<T extends string>({ value, options, onChange, label }: SegmentedProps<T>) {
  const id = useId();
  const reduceMotion = useReducedMotion();
  const index = options.findIndex((o) => o.value === value);
  const move = (delta: number) => {
    const next = options[(index + delta + options.length) % options.length];
    onChange(next.value);
  };
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="grid w-full rounded-[9px] bg-[var(--br-track)] p-[2px]"
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
              "relative flex h-[30px] items-center justify-center gap-1.5 rounded-[7px] px-1.5 text-[13px] transition-colors " +
              (active ? "font-semibold text-fg" : "font-medium text-fg-muted hover:text-fg")
            }
          >
            {active && (
              <motion.span
                layoutId={id}
                aria-hidden
                className="absolute inset-0 rounded-[7px] bg-[var(--br-thumb)] shadow-thumb"
                transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 38 }}
              />
            )}
            <span className="relative flex items-center gap-1.5 truncate">
              {opt.icon}
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
