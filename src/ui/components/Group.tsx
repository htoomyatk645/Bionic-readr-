import type { ReactNode } from "react";

interface GroupProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}

/** A titled card of settings rows, separated by hairlines. */
export function Group({ title, description, action, children }: GroupProps) {
  return (
    <section className="space-y-2">
      <div className="flex items-end justify-between gap-3 px-1">
        <div className="min-w-0">
          <h3 className="text-[12px] font-semibold text-fg">{title}</h3>
          {description && <p className="text-[12px] text-fg-subtle">{description}</p>}
        </div>
        {action}
      </div>
      <div className="rounded-[12px] border border-line bg-surface shadow-card divide-y divide-line">
        {children}
      </div>
    </section>
  );
}

interface RowProps {
  label: string;
  description?: string;
  htmlFor?: string;
  children?: ReactNode;
  /** Render children under the label instead of to the right. */
  stacked?: boolean;
}

export function Row({ label, description, htmlFor, children, stacked }: RowProps) {
  const text = (
    <div className="min-w-0">
      <label htmlFor={htmlFor} className="block text-[13px] font-medium text-fg">
        {label}
      </label>
      {description && (
        <p className="mt-0.5 text-[12px] leading-snug text-fg-subtle">{description}</p>
      )}
    </div>
  );
  if (stacked) {
    return (
      <div className="px-3.5 py-3 space-y-2.5">
        {text}
        {children}
      </div>
    );
  }
  return (
    <div className="px-3.5 py-3 flex items-center justify-between gap-4">
      {text}
      {children && <div className="shrink-0">{children}</div>}
    </div>
  );
}
