interface SwitchProps {
  checked: boolean;
  onChange(next: boolean): void;
  label: string;
  id?: string;
  disabled?: boolean;
}

/** A word that states the setting: "On" (marked) or "Off". */
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
        "min-w-[34px] rounded-[2px] py-0.5 text-right text-[13.5px] transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40 " +
        (checked ? "br-mark font-semibold text-fg" : "text-fg-subtle hover:text-fg")
      }
    >
      {checked ? "On" : "Off"}
    </button>
  );
}
