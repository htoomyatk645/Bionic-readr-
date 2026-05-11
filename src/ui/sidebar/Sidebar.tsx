import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { PopupBody } from "~ui/popup/Popup";
import { useSettings } from "~features/settings/store";

const PANEL_WIDTH = 475;
const LOG = "[bionic-redr/sidebar-ui]";

interface SidebarProps {
  open: boolean;
  onClose(): void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const hydrated = useSettings((s) => s.hydrated);
  const resetActiveMode = useSettings((s) => s.resetActiveMode);

  useEffect(() => {
    if (!open) return;
    console.info(LOG, "open");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          key="sidebar"
          initial={{ x: PANEL_WIDTH, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: PANEL_WIDTH, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 36, mass: 0.7 }}
          className="bionic-redr-sidebar dark"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: `${PANEL_WIDTH}px`,
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            background: "#131316",
            color: "#eeeef0",
            boxShadow:
              "-24px 0 64px rgba(0,0,0,0.32), -4px 0 12px rgba(0,0,0,0.18)",
            borderLeft: "1px solid rgba(255,255,255,0.06)",
            pointerEvents: "auto",
            fontFamily:
              '"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif'
          }}
        >
          <header className="px-5 pt-5 pb-3 flex items-center justify-between shrink-0">
            <div>
              <div
                className="font-display text-[18px] leading-none"
                style={{ color: "#eeeef0" }}
              >
                Bionic <span style={{ color: "#1DA7C6" }}>Redr</span>
              </div>
              <div
                className="text-[11px] mt-1.5 tracking-wide"
                style={{ color: "#8e8e98" }}
              >
                Attention optimizer · {hydrated ? "ready" : "…"}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close sidebar"
              className="w-8 h-8 rounded-full grid place-items-center transition-colors"
              style={{ color: "#8e8e98", background: "transparent", border: "none", cursor: "pointer" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                e.currentTarget.style.color = "#eeeef0";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#8e8e98";
              }}
            >
              <CloseIcon />
            </button>
          </header>

          <div className="flex-1 min-h-0 overflow-y-auto">
            <PopupBody />
          </div>

          <footer
            className="px-5 py-3 flex items-center justify-between text-[11px] shrink-0"
            style={{ color: "#8e8e98", borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            <span>v0.4 · Phase 4</span>
            <button
              type="button"
              onClick={() => {
                void resetActiveMode();
                onClose();
              }}
              style={{ color: "#8e8e98", background: "transparent", border: "none", cursor: "pointer" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#eeeef0")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#8e8e98")}
            >
              Reset & close
            </button>
          </footer>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M2 2L12 12M12 2L2 12"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
