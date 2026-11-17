import { useId } from "react";

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange(next: number): void;
  label: string;
  format?(value: number): string;
  /** Plain-language ends of the scale, e.g. ["Compact", "Airy"]. */
  ends?: [string, string];
}

export function Slider({ value, min, max, step, onChange, label, format, ends }: SliderProps) {
  const id = useId();
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  const shown = format ? format(value) : value.toFixed(2);
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-[13.5px] text-fg">
          {label}
        </label>
        <span className="br-serif text-[14px] italic tabular-nums text-fg-muted">{shown}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={shown}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="br-range mt-1"
        style={{ ["--br-fill" as string]: `${pct}%` }}
      />
      {ends && (
        <div aria-hidden className="mt-0.5 flex justify-between text-[10.5px] uppercase tracking-[0.12em] text-fg-subtle">
          <span>{ends[0]}</span>
          <span>{ends[1]}</span>
        </div>
      )}
    </div>
  );
}
