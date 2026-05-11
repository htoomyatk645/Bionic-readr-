import { motion } from "framer-motion";
import { MODE_META } from "~features/modes";
import { useSettings } from "~features/settings/store";
import type { ModeId } from "~features/settings/types";

export function ModeSection() {
  const current = useSettings((s) => s.settings.modes.current);
  const setMode = useSettings((s) => s.setMode);

  return (
    <div className="px-5 pt-5 space-y-2">
      {MODE_META.map((m) => {
        const active = m.id === current;
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => void setMode(m.id as ModeId)}
            className="relative w-full text-left rounded-xl px-4 py-3 transition-colors"
            style={{
              background: active ? "rgba(29, 167, 198, 0.10)" : "rgba(255, 255, 255, 0.03)",
              border: active
                ? "1px solid rgba(29, 167, 198, 0.45)"
                : "1px solid rgba(255, 255, 255, 0.06)",
              cursor: "pointer"
            }}
            onMouseEnter={(e) => {
              if (!active) e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
            }}
            onMouseLeave={(e) => {
              if (!active) e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div
                  className="font-display text-[14px] leading-none"
                  style={{ color: active ? "#1DA7C6" : "#eeeef0" }}
                >
                  {m.label}
                </div>
                <div className="text-[11.5px] mt-1.5 leading-snug" style={{ color: "#8e8e98" }}>
                  {m.tagline}
                </div>
              </div>
              <CheckIndicator active={active} />
            </div>
          </button>
        );
      })}
    </div>
  );
}

function CheckIndicator({ active }: { active: boolean }) {
  return (
    <motion.div
      animate={{ opacity: active ? 1 : 0, scale: active ? 1 : 0.85 }}
      transition={{ type: "spring", stiffness: 380, damping: 32 }}
      className="shrink-0"
      style={{
        width: 18,
        height: 18,
        borderRadius: 9999,
        background: "#1DA7C6",
        display: "grid",
        placeItems: "center"
      }}
    >
      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
        <path
          d="M1 4L3.6 6.5L9 1"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </motion.div>
  );
}
