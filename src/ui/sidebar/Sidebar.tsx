import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useSettings } from "~features/settings/store";
import { isHostExcluded } from "~features/settings/defaults";
import type { Theme } from "~features/settings/types";
import { CloseIcon } from "~ui/components/Icons";
import { Preview } from "~ui/components/Preview";
import { Switch } from "~ui/components/Switch";
import { AdaptiveGroup } from "./sections/AdaptiveGroup";
import { AppearanceGroup } from "./sections/AppearanceGroup";
import { FocusGroup } from "./sections/FocusGroup";
import { MemoryGroup } from "./sections/MemoryGroup";
import { ModePicker } from "./sections/ModePicker";
import { ReadingGroup } from "./sections/ReadingGroup";
import { TypographyGroup } from "./sections/TypographyGroup";

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
  const effective = useSettings((s) => s.effective);
  const toggleHost = useSettings((s) => s.toggleHostExcluded);
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
          <header className="flex shrink-0 items-center justify-between gap-3 px-4 pb-3 pt-4">
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden
                className="flex h-8 w-8 items-center justify-center whitespace-nowrap rounded-[9px] bg-accent text-[14px] font-extrabold leading-none tracking-tight text-accent-fg"
              >
                B<span className="font-medium opacity-80">r</span>
              </span>
              <div>
                <div className="text-[14px] font-semibold leading-tight text-fg">
                  <b>Bio</b>nic <b>Re</b>dr
                </div>
                <div className="text-[12px] leading-tight text-fg-subtle">Reading assistant</div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close panel"
              className="grid h-8 w-8 place-items-center rounded-[8px] text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
            >
              <CloseIcon />
            </button>
          </header>

          <div className="shrink-0 px-4 pb-3">
            <div
              className={
                "flex items-center justify-between gap-3 rounded-[12px] border px-3.5 py-3 transition-colors " +
                (excluded ? "border-line bg-surface-2" : "border-accent/40 bg-accent-soft")
              }
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-[13px] font-semibold text-fg">
                  <span
                    aria-hidden
                    className={"h-2 w-2 shrink-0 rounded-full " + (excluded ? "bg-fg-subtle" : "bg-accent")}
                  />
                  {excluded ? "Paused on this site" : "Active on this site"}
                </div>
                <div className="mt-0.5 truncate text-[12px] text-fg-muted" title={host}>
                  {host || "This page"}
                  {pausedVia && pausedVia !== host ? ` · via ${pausedVia}` : ""}
                </div>
              </div>
              <Switch
                label={excluded ? `Enable on ${host}` : `Pause on ${host}`}
                checked={!excluded}
                disabled={!host || !hydrated}
                onChange={() => void toggleHost(pausedVia ?? host)}
              />
            </div>
          </div>

          <div className="br-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6">
            <div
              className={"space-y-5 transition-opacity " + (hydrated ? "opacity-100" : "opacity-0")}
            >
              <ModePicker />
              <Preview bionic={effective.bionic} typography={effective.typography} />
              <ReadingGroup />
              <FocusGroup />
              <TypographyGroup />
              <AdaptiveGroup />
              <MemoryGroup />
              <AppearanceGroup />
            </div>
          </div>

          <footer className="flex shrink-0 items-center justify-between border-t border-line px-4 py-2.5 text-[12px] text-fg-subtle">
            <span>
              <kbd className="rounded-[5px] border border-line bg-surface px-1.5 py-[1px] font-sans text-[11px] text-fg-muted">
                {IS_MAC ? "⌘⇧B" : "Ctrl+Shift+B"}
              </kbd>{" "}
              toggles this panel
            </span>
            <span className="tabular-nums">v{extensionVersion()}</span>
          </footer>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
