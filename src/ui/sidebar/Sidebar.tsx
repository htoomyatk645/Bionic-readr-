import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSettings } from "~features/settings/store";
import { isHostExcluded } from "~features/settings/defaults";
import type { Theme } from "~features/settings/types";
import { CloseIcon } from "~ui/components/Icons";
import { Preview } from "~ui/components/Preview";
import { AnchorDial } from "./sections/AnchorDial";
import { ModePills } from "./sections/ModePills";
import { MoreSheet } from "./sections/MoreSheet";
import { ShowControls } from "./sections/ShowControls";

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
  const [sheet, setSheet] = useState(false);
  const closeSheet = useCallback(() => {
    setSheet(false);
    panelRef.current?.focus({ preventScroll: true });
  }, []);

  const host = window.location.hostname;
  const excluded = host ? isHostExcluded(settings, host) : false;
  // If the user paused a parent domain, un-pausing here removes that entry.
  const pausedVia = settings.excludedHosts.find((h) => host === h || host.endsWith(`.${h}`));

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!open) {
      setSheet(false);
      return;
    }
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
          className={`br-root br-theme-${theme} pointer-events-auto absolute right-0 top-0 flex h-screen flex-col overflow-hidden bg-bg shadow-panel outline-none`}
          style={{ width: `min(${PANEL_WIDTH}px, 100vw)` }}
        >
          <header className="flex shrink-0 items-start justify-between gap-3 px-6 pb-2 pt-5">
            <div className="min-w-0">
              <h1 className="text-[34px] font-bold leading-[1.1] tracking-[-0.03em] text-fg">Reading</h1>
              <div className="mt-1 flex min-w-0 items-center gap-1.5 text-[14px] text-fg-muted">
                <span
                  aria-hidden
                  className={"h-2 w-2 shrink-0 rounded-full transition-colors " + (excluded ? "bg-fg-subtle" : "bg-green")}
                />
                <span className="truncate" title={host}>
                  {excluded ? "Paused on" : "On for"} {host || "this page"}
                  {pausedVia && pausedVia !== host ? ` (via ${pausedVia})` : ""}
                </span>
                <span aria-hidden>·</span>
                <button
                  type="button"
                  disabled={!host || !hydrated}
                  onClick={() => void toggleHost(pausedVia ?? host)}
                  className="shrink-0 font-medium text-accent hover:opacity-80 disabled:opacity-40"
                >
                  {excluded ? "Resume" : "Pause"}
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close panel"
              className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface-2 text-fg-muted transition-colors hover:text-fg"
            >
              <CloseIcon width={13} height={13} strokeWidth={2.4} />
            </button>
          </header>

          <div className="br-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-4 pt-3">
            <div className={"space-y-7 transition-opacity " + (hydrated ? "opacity-100" : "opacity-0")}>
              <div className="rounded-[22px] bg-surface-2 p-5">
                <Preview bionic={effective.bionic} typography={effective.typography} dimmed={excluded} />
              </div>
              <AnchorDial />
              <ModePills />
              <ShowControls />
            </div>
          </div>

          <footer className="shrink-0 space-y-2.5 px-6 pb-5 pt-3">
            <button
              type="button"
              onClick={() => setSheet(true)}
              className="h-[50px] w-full rounded-full bg-accent text-[16px] font-semibold text-accent-fg transition-opacity hover:opacity-90 active:opacity-80"
            >
              More Settings
            </button>
            <p className="text-center text-[12px] text-fg-muted">
              {IS_MAC ? "⌘⇧B" : "Ctrl+Shift+B"} opens and closes · v{extensionVersion()}
            </p>
          </footer>

          <AnimatePresence>{sheet && <MoreSheet key="sheet" onClose={closeSheet} />}</AnimatePresence>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
