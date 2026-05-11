import { useEffect } from "react";
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

export function PopupBody() {
  const hydrate = useSettings((s) => s.hydrate);
  const effective = useSettings((s) => s.effective);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <div className="font-sans">
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
    </div>
  );
}
