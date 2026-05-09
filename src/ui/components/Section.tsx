import type { ReactNode } from "react";

interface SectionProps {
  title?: string;
  hint?: string;
  children: ReactNode;
}

export function Section({ title, hint, children }: SectionProps) {
  return (
    <section className="px-5 py-4 border-b border-ink-100/70 dark:border-ink-800/70 last:border-b-0">
      {title && (
        <div className="mb-3">
          <h3 className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-400">
            {title}
          </h3>
          {hint && <p className="text-[12px] text-ink-400 mt-0.5">{hint}</p>}
        </div>
      )}
      <div className="space-y-3">{children}</div>
    </section>
  );
}
