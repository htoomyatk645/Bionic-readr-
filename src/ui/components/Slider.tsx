import { useId } from "react";

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange(next: number): void;
  label: string;
  format?(value: number): string;
  /** Plain-language ends of the scale, e.g. ["Tighter", "Airier"]. */
  ends?: [string, string];
}

export function Slider({ value, min, max, step, onChange, label, format, ends }: SliderProps) {
  const id = useId();
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  const shown = format ? format(value) : value.toFixed(2);
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-[13px] font-medium text-fg">
          {label}
        </label>
        <span className="text-[12px] tabular-nums text-fg-subtle">{shown}</span>
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
        className="br-range"
        style={{ ["--br-fill" as string]: `${pct}%` }}
      />
      {ends && (
        <div aria-hidden className="flex justify-between text-[11px] text-fg-subtle">
          <span>{ends[0]}</span>
          <span>{ends[1]}</span>
        </div>
      )}
    </div>
  );
}
