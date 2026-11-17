import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useId, type ComponentType, type ReactNode, type SVGProps } from "react";
import { ChevronIcon } from "./Icons";

interface DisclosureProps {
  title: string;
  /** One-glance state of what's inside, shown while collapsed. */
  summary: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  open: boolean;
  onToggle(): void;
  children: ReactNode;
}

/**
 * A settings row that expands in place. Collapsed rows show their current
 * value, so the whole panel can be read at a glance without opening anything
 * (recognition over recall; one decision surface at a time).
 */
export function Disclosure({ title, summary, icon: Icon, open, onToggle, children }: DisclosureProps) {
  const id = useId();
  const reduceMotion = useReducedMotion();
  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors hover:bg-surface-2/60"
      >
        <span
          className={
            "grid h-8 w-8 shrink-0 place-items-center rounded-[9px] transition-colors " +
            (open ? "bg-accent text-accent-fg" : "bg-surface-2 text-fg-muted")
          }
        >
          <Icon />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13.5px] font-medium text-fg">{title}</span>
          <span className="block truncate text-[12px] text-fg-subtle">{summary}</span>
        </span>
        <ChevronIcon
          className={"shrink-0 text-fg-subtle transition-transform duration-200 " + (open ? "rotate-90" : "")}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-4 px-3.5 pb-4 pt-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface FieldProps {
  label: string;
  hint?: string;
  children: ReactNode;
  /** Put the control on the same line as the label (switches). */
  inline?: boolean;
}

export function Field({ label, hint, children, inline }: FieldProps) {
  const text = (
    <div className="min-w-0">
      <div className="text-[13px] font-medium text-fg">{label}</div>
      {hint && <p className="mt-0.5 text-[12px] leading-snug text-fg-subtle">{hint}</p>}
    </div>
  );
  if (inline) {
    return (
      <div className="flex items-center justify-between gap-4">
        {text}
        <div className="shrink-0">{children}</div>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {text}
      {children}
    </div>
  );
}
