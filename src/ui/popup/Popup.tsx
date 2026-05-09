import { useEffect } from "react";
import { motion } from "framer-motion";
import { Preview } from "~ui/components/Preview";
import { ModeSection } from "./sections/ModeSection";
import { ReadingSection } from "./sections/ReadingSection";
import { SkimSection } from "./sections/SkimSection";
import { RadarSection } from "./sections/RadarSection";
import { TypographySection } from "./sections/TypographySection";
import { AdaptiveSection } from "./sections/AdaptiveSection";
import { MemorySection } from "./sections/MemorySection";
import { SiteSection } from "./sections/SiteSection";
import { useSettings } from "~features/settings/store";

export function Popup() {
  const hydrated = useSettings((s) => s.hydrated);
  const hydrate = useSettings((s) => s.hydrate);
  const effective = useSettings((s) => s.effective);
  const resetActiveMode = useSettings((s) => s.resetActiveMode);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="surface w-[360px] font-sans max-h-[600px] overflow-y-auto"
    >
      <header className="px-5 pt-5 pb-1">
        <div>
          <div className="text-[15px] font-semibold tracking-tight">
            Bionic <span className="text-accent">Redr</span>
          </div>
          <div className="text-[11px] text-ink-400 mt-0.5">
            Attention optimizer · {hydrated ? "ready" : "…"}
          </div>
        </div>
      </header>

      <ModeSection />

      <div className="px-5 pt-4">
        <Preview settings={effective.bionic} />
      </div>

      <div className="mt-2">
        <ReadingSection />
        <SkimSection />
        <RadarSection />
        <TypographySection />
        <AdaptiveSection />
        <MemorySection />
        <SiteSection />
      </div>

      <footer className="px-5 py-3 flex items-center justify-between text-[11px] text-ink-400">
        <span>v0.2 · Phase 2</span>
        <button
          type="button"
          onClick={() => resetActiveMode()}
          className="hover:text-ink-700 dark:hover:text-ink-200 transition-colors"
        >
          Reset this mode
        </button>
      </footer>
    </motion.div>
  );
}
