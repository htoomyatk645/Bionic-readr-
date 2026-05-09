import type { ChangeEvent } from "react";

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange(next: number): void;
  label?: string;
  format?(value: number): string;
}

export function Slider({ value, min, max, step, onChange, label, format }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex items-baseline justify-between">
          <span className="text-[12px] text-ink-600 dark:text-ink-300">{label}</span>
          <span className="text-[11px] tabular-nums text-ink-400">
            {format ? format(value) : value.toFixed(2)}
          </span>
        </div>
      )}
      <div className="relative h-[18px] flex items-center">
        <div className="absolute inset-x-0 h-[3px] rounded-full bg-ink-100 dark:bg-ink-800" />
        <div
          className="absolute h-[3px] rounded-full bg-accent"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(parseFloat(e.target.value))}
          className="bionic-slider relative w-full appearance-none bg-transparent"
        />
      </div>
    </div>
  );
}
