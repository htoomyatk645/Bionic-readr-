import { useEffect } from "react";
import { Preview } from "~ui/components/Preview";
import { ModeSection } from "./sections/ModeSection";
import { SiteSection } from "./sections/SiteSection";
import { useSettings } from "~features/settings/store";

export function PopupBody() {
  const hydrate = useSettings((s) => s.hydrate);
  const effective = useSettings((s) => s.effective);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <div className="font-sans pb-4">
      <ModeSection />

      <div className="px-5 pt-5">
        <div className="text-[10.5px] uppercase tracking-[0.08em] mb-2" style={{ color: "#6c6c76" }}>
          Preview
        </div>
        <Preview settings={effective.bionic} />
      </div>

      <div className="pt-4">
        <SiteSection />
      </div>
    </div>
  );
}
