import { motion } from "framer-motion";
import { useId } from "react";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedProps<T extends string> {
  value: T;
  options: SegmentedOption<T>[];
  onChange(next: T): void;
}

export function Segmented<T extends string>({ value, options, onChange }: SegmentedProps<T>) {
  const layoutId = useId();
  return (
    <div className="relative inline-grid grid-flow-col auto-cols-fr w-full p-[3px] rounded-xl bg-ink-100/80 dark:bg-ink-800/70">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={
              "relative z-10 px-3 py-1.5 text-[12px] font-medium rounded-[9px] transition-colors " +
              (active
                ? "text-ink-900 dark:text-ink-50"
                : "text-ink-500 hover:text-ink-700 dark:hover:text-ink-200")
            }
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                transition={{ type: "spring", stiffness: 360, damping: 38, mass: 0.7 }}
                className="absolute inset-0 -z-10 rounded-[9px] bg-white dark:bg-ink-700 shadow-soft"
              />
            )}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
