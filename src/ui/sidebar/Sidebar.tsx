import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useSettings } from "~features/settings/store";
import { isHostExcluded } from "~features/settings/defaults";
import type { Theme } from "~features/settings/types";
import { CloseIcon, ResetIcon } from "~ui/components/Icons";
import { Switch } from "~ui/components/Switch";
import { FineTune } from "./sections/FineTune";
import { ModeTiles } from "./sections/ModeTiles";
import { ReaderCard } from "./sections/ReaderCard";

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
  const resetActiveMode = useSettings((s) => s.resetActiveMode);
  const customized = Object.keys(settings.modes.customizations[settings.modes.current] ?? {}).length > 0;
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
          <header className="flex shrink-0 items-center gap-3 px-4 pb-2 pt-4">
            <svg aria-hidden width="28" height="28" viewBox="0 0 128 128" className="shrink-0">
              <rect width="128" height="128" rx="30" fill="rgb(var(--br-accent))" />
              <g fill="rgb(var(--br-accent-fg))">
                <rect x="24" y="35" width="32" height="13" rx="6.5" />
                <rect x="62" y="38.5" width="42" height="6" rx="3" fillOpacity="0.55" />
                <rect x="24" y="57.5" width="22" height="13" rx="6.5" />
                <rect x="52" y="61" width="52" height="6" rx="3" fillOpacity="0.55" />
                <rect x="24" y="80" width="40" height="13" rx="6.5" />
                <rect x="70" y="83.5" width="22" height="6" rx="3" fillOpacity="0.55" />
              </g>
            </svg>
            <div className="min-w-0 flex-1 text-[14px] leading-tight text-fg">
              <b className="font-bold">Bio</b>nic <b className="font-bold">Re</b>dr
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close panel"
              className="-mr-1 grid h-8 w-8 place-items-center rounded-full text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
            >
              <CloseIcon />
            </button>
          </header>

          <div className="br-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6 pt-2">
            <div className={"space-y-6 transition-opacity " + (hydrated ? "opacity-100" : "opacity-0")}>
              {/* Site switch: the one decision that matters most, worded as a state. */}
              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-[14px] bg-surface-2 px-3.5 py-2.5">
                <span className="min-w-0">
                  <span className="flex items-center gap-2 text-[13px] font-medium text-fg">
                    <span
                      aria-hidden
                      className={
                        "h-2 w-2 shrink-0 rounded-full transition-colors " +
                        (excluded ? "bg-fg-subtle" : "bg-accent shadow-[0_0_0_3px_rgb(var(--br-accent)/0.18)]")
                      }
                    />
                    {excluded ? "Paused here" : "Reading aid on"}
                  </span>
                  <span className="mt-0.5 block truncate pl-4 text-[12px] text-fg-subtle" title={host}>
                    {host || "This page"}
                    {pausedVia && pausedVia !== host ? ` · via ${pausedVia}` : ""}
                  </span>
                </span>
                <Switch
                  label={excluded ? `Enable on ${host}` : `Pause on ${host}`}
                  checked={!excluded}
                  disabled={!host || !hydrated}
                  onChange={() => void toggleHost(pausedVia ?? host)}
                />
              </label>

              <ReaderCard paused={excluded} />
              <ModeTiles />
              <FineTune />
            </div>
          </div>

          <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-line px-4 py-2.5 text-[12px] text-fg-subtle">
            <span>
              <kbd className="rounded-[5px] border border-line bg-surface px-1.5 py-[1px] font-sans text-[11px] text-fg-muted">
                {IS_MAC ? "⌘⇧B" : "Ctrl+Shift+B"}
              </kbd>{" "}
              to toggle
            </span>
            <span className="flex items-center gap-3">
              {customized && (
                <button
                  type="button"
                  onClick={() => void resetActiveMode()}
                  className="inline-flex items-center gap-1 rounded-[6px] px-1 text-fg-muted hover:text-fg"
                >
                  <ResetIcon /> Reset mode
                </button>
              )}
              <span className="tabular-nums">v{extensionVersion()}</span>
            </span>
          </footer>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
