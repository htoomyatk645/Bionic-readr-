interface SwitchProps {
  checked: boolean;
  onChange(next: boolean): void;
  label: string;
  id?: string;
  disabled?: boolean;
}

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
        "relative inline-flex h-[22px] w-[38px] shrink-0 items-center rounded-full transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed " +
        (checked ? "bg-accent" : "bg-line")
      }
    >
      <span
        aria-hidden
        className={
          "inline-block h-[18px] w-[18px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.25)] transition-transform duration-200 ease-out " +
          (checked ? "translate-x-[18px]" : "translate-x-[2px]")
        }
      />
    </button>
  );
}
