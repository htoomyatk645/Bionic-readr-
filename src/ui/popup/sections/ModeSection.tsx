import { motion } from "framer-motion";
import { MODE_META } from "~features/modes";
import { useSettings } from "~features/settings/store";
import type { ModeId } from "~features/settings/types";

export function ModeSection() {
  const current = useSettings((s) => s.settings.modes.current);
  const setMode = useSettings((s) => s.setMode);

  return (
    <div className="px-5 pt-5">
      <div className="grid grid-cols-4 gap-1.5">
        {MODE_META.map((m) => {
          const active = m.id === current;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id as ModeId)}
              className={
                "relative px-2 py-2 rounded-xl text-[11.5px] font-medium transition-colors " +
                (active
                  ? "text-ink-900 dark:text-ink-50"
                  : "text-ink-500 hover:text-ink-700 dark:hover:text-ink-200")
              }
            >
              {active && (
                <motion.span
                  layoutId="mode-indicator"
                  transition={{ type: "spring", stiffness: 480, damping: 36 }}
                  className="absolute inset-0 -z-10 rounded-xl bg-ink-100/90 dark:bg-ink-800/80"
                />
              )}
              <span className="relative z-10">{m.label}</span>
            </button>
          );
        })}
      </div>
      <p className="text-[11.5px] text-ink-400 mt-2.5 leading-relaxed">
        {MODE_META.find((m) => m.id === current)?.tagline}
      </p>
    </div>
  );
}
