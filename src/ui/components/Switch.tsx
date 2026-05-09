import { motion } from "framer-motion";

interface SwitchProps {
  checked: boolean;
  onChange(next: boolean): void;
  label?: string;
}

export function Switch({ checked, onChange, label }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={
        "relative inline-flex h-[22px] w-[38px] shrink-0 items-center rounded-full transition-colors " +
        (checked
          ? "bg-accent"
          : "bg-ink-200 dark:bg-ink-700")
      }
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 380, damping: 34, mass: 0.6 }}
        className={
          "inline-block h-[18px] w-[18px] rounded-full bg-white shadow-sm " +
          (checked ? "ml-[18px]" : "ml-[2px]")
        }
      />
    </button>
  );
}
