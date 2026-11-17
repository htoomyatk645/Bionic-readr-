interface SwitchProps {
  checked: boolean;
  onChange(next: boolean): void;
  label: string;
  id?: string;
  disabled?: boolean;
}

/** iOS-style switch. */
export function Switch({ checked, onChange, label, id, disabled }: SwitchProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={
        "relative inline-flex h-[31px] w-[51px] shrink-0 items-center rounded-full transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40 " +
        (checked ? "bg-green" : "bg-[var(--br-track)]")
      }
    >
      <span
        aria-hidden
        className={
          "inline-block h-[27px] w-[27px] rounded-full bg-white shadow-[0_3px_8px_rgba(0,0,0,0.15),0_1px_1px_rgba(0,0,0,0.12)] transition-transform duration-200 ease-out " +
          (checked ? "translate-x-[22px]" : "translate-x-[2px]")
        }
      />
    </button>
  );
}
