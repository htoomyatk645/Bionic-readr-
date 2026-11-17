import type { ReactNode } from "react";

/** An iOS inset-grouped list: optional header, rounded card, optional footer. */
export function Group({ header, footer, children }: { header?: string; footer?: ReactNode; children: ReactNode }) {
  return (
    <section>
      {header && (
        <h3 className="mb-1.5 px-4 text-[12.5px] font-normal uppercase tracking-[0.02em] text-fg-muted">{header}</h3>
      )}
      <div className="overflow-hidden rounded-[12px] bg-surface [&>*+*]:border-t-[0.5px] [&>*+*]:border-line">
        {children}
      </div>
      {footer && <p className="mt-1.5 px-4 text-[12.5px] leading-snug text-fg-muted">{footer}</p>}
    </section>
  );
}

/** One row: label left, control (switch, value) right. */
export function Row({ label, children }: { label: string; children?: ReactNode }) {
  return (
    <div className="flex min-h-[48px] items-center justify-between gap-3 px-4 py-1.5">
      <span className="min-w-0 text-fg">{label}</span>
      {children}
    </div>
  );
}
