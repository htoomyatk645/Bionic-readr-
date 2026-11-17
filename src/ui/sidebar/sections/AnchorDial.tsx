import type { Intensity } from "~core/bionic/types";
import { useSettings } from "~features/settings/store";
import { MinusIcon, PlusIcon } from "~ui/components/Icons";

const LEVELS: { id: "off" | Intensity; label: string }[] = [
  { id: "off", label: "Off" },
  { id: "low", label: "Light" },
  { id: "medium", label: "Medium" },
  { id: "high", label: "Strong" },
  { id: "max", label: "Max" }
];

/** The one control that matters most: a big readout with − / + either side. */
export function AnchorDial() {
  const bionic = useSettings((s) => s.effective.bionic);
  const patch = useSettings((s) => s.patchActiveBionic);
  const index = bionic.enabled ? LEVELS.findIndex((l) => l.id === bionic.intensity) : 0;

  const go = (next: number) => {
    const l = LEVELS[Math.max(0, Math.min(LEVELS.length - 1, next))];
    void patch(l.id === "off" ? { enabled: false } : { enabled: true, intensity: l.id });
  };

  return (
    <section className="flex flex-col items-center gap-3" aria-label="Word anchors">
      <div id="br-anchor-label" className="text-[13px] font-medium text-fg-muted">
        Word anchors
      </div>
      <div className="flex items-center gap-6">
        <button
          type="button"
          onClick={() => go(index - 1)}
          disabled={index === 0}
          aria-label="Lighter anchors"
          className="grid h-[52px] w-[52px] place-items-center rounded-full bg-surface-2 text-fg transition-[transform,opacity] active:scale-95 disabled:opacity-35"
        >
          <MinusIcon />
        </button>
        <div className="w-[150px] text-center">
          <div
            role="status"
            aria-live="polite"
            className="text-[40px] font-bold leading-[1.1] tracking-[-0.03em] text-fg"
          >
            {LEVELS[index].label}
          </div>
          <div className="mt-2.5 flex justify-center gap-[7px]" aria-hidden>
            {LEVELS.map((l, i) => (
              <button
                key={l.id}
                type="button"
                tabIndex={-1}
                onClick={() => go(i)}
                className={"h-[7px] w-[7px] rounded-full transition-colors " + (i <= index ? "bg-fg" : "bg-line")}
              />
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => go(index + 1)}
          disabled={index === LEVELS.length - 1}
          aria-label="Stronger anchors"
          className="grid h-[52px] w-[52px] place-items-center rounded-full bg-surface-2 text-fg transition-[transform,opacity] active:scale-95 disabled:opacity-35"
        >
          <PlusIcon />
        </button>
      </div>
    </section>
  );
}
