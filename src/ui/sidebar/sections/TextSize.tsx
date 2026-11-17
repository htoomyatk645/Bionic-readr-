import { useSettings } from "~features/settings/store";

const STEPS = [0.85, 0.9, 1, 1.1, 1.2, 1.35, 1.5];

function nearest(scale: number): number {
  let best = 0;
  STEPS.forEach((s, i) => {
    if (Math.abs(s - scale) < Math.abs(STEPS[best] - scale)) best = i;
  });
  return best;
}

/** Apple-style text size stepper: small A, current size, large A. */
export function TextSize() {
  const scale = useSettings((s) => s.effective.typography.fontScale ?? 1);
  const patch = useSettings((s) => s.patchActiveTypography);
  const i = nearest(scale);
  const go = (next: number) => void patch({ fontScale: STEPS[Math.max(0, Math.min(STEPS.length - 1, next))] });

  return (
    <div className="flex min-h-[52px] items-center justify-between gap-3 px-4 py-2">
      <span className="text-fg">Text size</span>
      <div className="flex h-[36px] items-stretch overflow-hidden rounded-[9px] bg-[var(--br-track)]">
        <button
          type="button"
          onClick={() => go(i - 1)}
          disabled={i === 0}
          aria-label="Smaller text"
          className="grid w-[44px] place-items-center text-[13px] font-medium text-fg transition-opacity hover:opacity-70 disabled:opacity-30"
        >
          A
        </button>
        <span
          role="status"
          aria-live="polite"
          aria-label={`Text size ${Math.round(STEPS[i] * 100)} percent`}
          className="grid min-w-[58px] place-items-center border-x-[0.5px] border-line px-1 text-[14px] tabular-nums text-fg"
        >
          {Math.round(STEPS[i] * 100)}%
        </span>
        <button
          type="button"
          onClick={() => go(i + 1)}
          disabled={i === STEPS.length - 1}
          aria-label="Larger text"
          className="grid w-[44px] place-items-center text-[19px] font-medium text-fg transition-opacity hover:opacity-70 disabled:opacity-30"
        >
          A
        </button>
      </div>
    </div>
  );
}
