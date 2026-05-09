import type { ReactNode } from "react";

interface RowProps {
  label: string;
  hint?: string;
  children: ReactNode;
}

export function Row({ label, hint, children }: RowProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="text-[13px] text-ink-800 dark:text-ink-100">{label}</div>
        {hint && <div className="text-[11px] text-ink-400 mt-0.5">{hint}</div>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
