import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useSettings } from "~features/settings/store";
import { isHostExcluded } from "~features/settings/defaults";
import type { Theme } from "~features/settings/types";
import { CloseIcon } from "~ui/components/Icons";
import { Preview } from "~ui/components/Preview";
import { Adjust } from "./sections/Adjust";
import { Anchors } from "./sections/Anchors";
import { Modes } from "./sections/Modes";

const PANEL_WIDTH = 400;
const IS_MAC = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

interface SidebarProps {
  open: boolean;
  onClose(): void;
}

function useResolvedTheme(theme: Theme): "light" | "dark" {
  const query = "(prefers-color-scheme: dark)";
  const [systemDark, setSystemDark] = useState(() => window.matchMedia?.(query).matches ?? false);
  useEffect(() => {
    const mq = window.matchMedia?.(query);
    if (!mq) return;
    const on = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  if (theme === "system") return systemDark ? "dark" : "light";
  return theme;
}

function extensionVersion(): string {
  try {
    return chrome.runtime.getManifest().version;
  } catch {
    return "";
  }
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const hydrate = useSettings((s) => s.hydrate);
  const hydrated = useSettings((s) => s.hydrated);
  const settings = useSettings((s) => s.settings);
  const toggleHost = useSettings((s) => s.toggleHostExcluded);
  const effective = useSettings((s) => s.effective);
  const theme = useResolvedTheme(settings.theme);
  const reduceMotion = useReducedMotion();
  const panelRef = useRef<HTMLElement>(null);

  const host = window.location.hostname;
  const excluded = host ? isHostExcluded(settings, host) : false;
  // If the user paused a parent domain, un-pausing here removes that entry.
  const pausedVia = settings.excludedHosts.find((h) => host === h || host.endsWith(`.${h}`));

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!open) return;
    // Move focus into the panel (not onto a control) so keyboard users land
    // inside it without a stray focus ring on the close button.
    panelRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !e.defaultPrevented) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const transition = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 380, damping: 40, mass: 0.7 };

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          key="sidebar"
          ref={panelRef}
          tabIndex={-1}
          role="dialog"
          aria-label="Bionic Redr settings"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={transition}
          className={`br-root br-theme-${theme} pointer-events-auto absolute right-0 top-0 flex h-screen flex-col border-l border-line bg-bg shadow-panel outline-none`}
          style={{ width: `min(${PANEL_WIDTH}px, 100vw)` }}
        >
          <header className="flex shrink-0 items-start justify-between gap-3 px-6 pb-4 pt-5">
            <div className="min-w-0">
              <div className="br-serif text-[22px] leading-none tracking-[-0.01em] text-fg">
                <b className="font-bold">Bio</b>nic <b className="font-bold">Re</b>dr
              </div>
              {/* Status as a sentence; the state word is itself the switch. */}
              <p className="mt-2 text-[13px] leading-snug text-fg-muted">
                Reading aid is{" "}
                <button
                  type="button"
                  role="switch"
                  aria-checked={!excluded}
                  aria-label={excluded ? `Enable on ${host}` : `Pause on ${host}`}
                  disabled={!host || !hydrated}
                  onClick={() => void toggleHost(pausedVia ?? host)}
                  className={
                    "rounded-[2px] font-semibold transition-colors disabled:cursor-not-allowed " +
                    (excluded ? "text-fg-subtle underline decoration-dotted underline-offset-2" : "br-mark text-fg")
                  }
                >
                  {excluded ? "paused" : "on"}
                </button>{" "}
                for <span className="text-fg" title={host}>{host || "this page"}</span>
                {pausedVia && pausedVia !== host ? ` (via ${pausedVia})` : ""}.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close panel"
              className="-mr-2 -mt-1 grid h-8 w-8 place-items-center text-fg-subtle transition-colors hover:text-fg"
            >
              <CloseIcon />
            </button>
          </header>

          <div className="br-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-8">
            <div className={"space-y-6 transition-opacity " + (hydrated ? "opacity-100" : "opacity-0")}>
              <div className="border-l-2 border-fg pl-4">
                <Preview bionic={effective.bionic} typography={effective.typography} dimmed={excluded} />
              </div>
              <Anchors />
              <Modes />
              <Adjust />
            </div>
          </div>

          <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-line px-6 py-3 text-[11px] uppercase tracking-[0.12em] text-fg-subtle">
            <span>
              <kbd className="font-sans normal-case tracking-normal text-fg-muted">{IS_MAC ? "⌘⇧B" : "Ctrl+Shift+B"}</kbd>{" "}
              opens &amp; closes
            </span>
            <span className="normal-case tabular-nums">v{extensionVersion()}</span>
          </footer>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
