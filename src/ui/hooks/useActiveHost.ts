import { useEffect, useState } from "react";

export function useActiveHost(): string | null {
  const [host, setHost] = useState<string | null>(null);

  useEffect(() => {
    const c = (globalThis as unknown as { chrome?: typeof chrome }).chrome;
    if (!c?.tabs?.query) {
      setHost(null);
      return;
    }
    c.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0]?.url;
      if (!url) return;
      try {
        setHost(new URL(url).hostname);
      } catch {
        setHost(null);
      }
    });
  }, []);

  return host;
}
