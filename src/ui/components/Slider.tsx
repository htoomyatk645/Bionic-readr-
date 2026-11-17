import { useId } from "react";

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange(next: number): void;
  label: string;
  format?(value: number): string;
}

export function Slider({ value, min, max, step, onChange, label, format }: SliderProps) {
  const id = useId();
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  const shown = format ? format(value) : value.toFixed(2);
  return (
    <div className="px-4 pb-2 pt-3">
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-fg">
          {label}
        </label>
        <span className="tabular-nums text-fg-muted">{shown}</span>
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
    </div>
  );
}
