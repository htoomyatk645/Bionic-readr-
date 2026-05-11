import cssText from "data-text:~style.css";
import type { PlasmoCSConfig, PlasmoGetStyle } from "plasmo";
import { useEffect, useState } from "react";
import { Sidebar } from "~ui/sidebar/Sidebar";

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: false,
  run_at: "document_idle"
};

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style");
  style.textContent = cssText;
  return style;
};

const TOGGLE_MESSAGE_TYPE = "bionic-redr.toggle-sidebar";
const CLOSE_MESSAGE_TYPE = "bionic-redr.close-sidebar";

export default function SidebarRoot() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const c = (globalThis as unknown as { chrome?: typeof chrome }).chrome;
    if (!c?.runtime?.onMessage) return;

    const handler = (
      message: { type?: string } | null,
      _sender: chrome.runtime.MessageSender,
      sendResponse: (response: unknown) => void
    ) => {
      if (!message) return false;
      if (message.type === TOGGLE_MESSAGE_TYPE) {
        setOpen((v) => !v);
        sendResponse({ ok: true });
        return true;
      }
      if (message.type === CLOSE_MESSAGE_TYPE) {
        setOpen(false);
        sendResponse({ ok: true });
        return true;
      }
      return false;
    };

    c.runtime.onMessage.addListener(handler);
    return () => {
      try {
        c.runtime.onMessage.removeListener(handler);
      } catch {
        /* extension context invalidated — ignore */
      }
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.ctrlKey || e.metaKey;
      if (meta && e.shiftKey && (e.key === "B" || e.key === "b")) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, []);

  return <Sidebar open={open} onClose={() => setOpen(false)} />;
}
