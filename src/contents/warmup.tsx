import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { computeWarmup, type WarmupSuggestion } from "~features/memory";
import { getValue, onValueChanged } from "~core/storage";
import { DEFAULT_SETTINGS, SETTINGS_KEY } from "~features/settings/defaults";
import type { ReaderSettings } from "~features/settings/types";

const HOST_ID = "bionic-redr-warmup-host";
const SHOWN_FLAG = "bionic-redr-warmup-shown";

const CSS = `
  .warmup-root {
    position: fixed;
    bottom: 18px;
    left: 18px;
    z-index: 2147483640;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif;
    max-width: 320px;
    pointer-events: none;
  }
  .warmup-card {
    pointer-events: auto;
    background: rgba(255, 255, 255, 0.92);
    color: #222227;
    backdrop-filter: blur(14px) saturate(140%);
    -webkit-backdrop-filter: blur(14px) saturate(140%);
    border: 1px solid rgba(15, 15, 20, 0.08);
    border-radius: 14px;
    padding: 12px 14px;
    box-shadow: 0 1px 2px rgba(15, 15, 20, 0.04), 0 16px 40px rgba(15, 15, 20, 0.08);
  }
  .warmup-label {
    font-size: 10.5px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #8e8e98;
    margin-bottom: 4px;
  }
  .warmup-message { font-size: 13px; line-height: 1.45; color: #36363d; }
  .warmup-actions { display: flex; gap: 8px; margin-top: 10px; }
  .warmup-btn {
    font-size: 12px;
    font-weight: 500;
    border-radius: 8px;
    padding: 5px 10px;
    border: none;
    cursor: pointer;
    transition: background 140ms ease, color 140ms ease;
    font-family: inherit;
  }
  .warmup-btn-primary { background: #1DA7C6; color: white; }
  .warmup-btn-primary:hover { background: #1a8aa5; }
  .warmup-btn-ghost { background: transparent; color: #6c6c76; }
  .warmup-btn-ghost:hover { color: #36363d; }
  @media (prefers-color-scheme: dark) {
    .warmup-card {
      background: rgba(34, 34, 39, 0.88);
      color: #eeeef0;
      border-color: rgba(255, 255, 255, 0.08);
    }
    .warmup-message { color: #d9d9de; }
    .warmup-label { color: #8e8e98; }
    .warmup-btn-ghost { color: #b8b8c0; }
    .warmup-btn-ghost:hover { color: #f7f7f8; }
  }
`;

function Warmup() {
  const [suggestion, setSuggestion] = useState<WarmupSuggestion | null>(null);
  const [enabled, setEnabled] = useState<boolean>(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const settings = await getValue<ReaderSettings>(SETTINGS_KEY, DEFAULT_SETTINGS);
      const memory = settings.memory ?? DEFAULT_SETTINGS.memory;
      setEnabled(Boolean(memory.enabled && memory.showWarmup));
      if (!memory.enabled || !memory.showWarmup) return;
      if (window.sessionStorage.getItem(SHOWN_FLAG) === "1") return;
      const s = await computeWarmup();
      if (cancelled || !s) return;
      window.sessionStorage.setItem(SHOWN_FLAG, "1");
      setSuggestion(s);
      window.setTimeout(() => setDismissed(true), 9000);
    })();

    const unsub = onValueChanged<ReaderSettings>(SETTINGS_KEY, (next) => {
      const memory = next?.memory ?? DEFAULT_SETTINGS.memory;
      setEnabled(Boolean(memory.enabled && memory.showWarmup));
    });

    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  const visible = enabled && suggestion && !dismissed;

  return (
    <div className="warmup-root">
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.34, ease: [0.22, 0.61, 0.36, 1] }}
            className="warmup-card"
          >
            <div className="warmup-label">Welcome back</div>
            <div className="warmup-message">{suggestion!.message}</div>
            <div className="warmup-actions">
              {suggestion!.scrollY != null && (
                <button
                  type="button"
                  className="warmup-btn warmup-btn-primary"
                  onClick={() => {
                    if (suggestion!.scrollY != null) {
                      window.scrollTo({ top: suggestion!.scrollY, behavior: "smooth" });
                    }
                    setDismissed(true);
                  }}
                >
                  Resume reading
                </button>
              )}
              <button
                type="button"
                className="warmup-btn warmup-btn-ghost"
                onClick={() => setDismissed(true)}
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function mount() {
  if (document.getElementById(HOST_ID)) return;
  const host = document.createElement("div");
  host.id = HOST_ID;
  document.documentElement.appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = CSS;
  shadow.appendChild(style);

  const mountPoint = document.createElement("div");
  shadow.appendChild(mountPoint);

  createRoot(mountPoint).render(<Warmup />);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount, { once: true });
} else {
  mount();
}
