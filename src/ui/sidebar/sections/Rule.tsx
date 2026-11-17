import type { ReactNode } from "react";

/** A section in the editorial layout: hairline rule, small-caps kicker. */
export function Rule({ kicker, aside, children }: { kicker: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="border-t border-line pt-3.5">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h3 className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-fg-subtle">{kicker}</h3>
        {aside}
      </div>
      {children}
    </section>
  );
}

/** Label on the left, control on the right — a line of type, not a box. */
export function Line({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <div className="min-w-0">
        <div className="text-[13.5px] text-fg">{label}</div>
        {hint && <p className="br-serif mt-0.5 text-[13px] italic leading-snug text-fg-subtle">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
