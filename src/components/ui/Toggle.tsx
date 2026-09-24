import React from "react";
import { clsx } from "clsx";

interface ToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  label,
  description,
  checked,
  onChange,
  disabled = false,
  className,
  id,
}) => {
  const toggleId = id || `toggle-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div
      className={clsx(
        "flex items-center justify-between gap-4 p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E1D9] transition-colors hover:border-[#D8CEC5]",
        disabled && "opacity-60 cursor-not-allowed",
        className
      )}
    >
      <div className="space-y-0.5 flex-1 pr-2">
        <label htmlFor={toggleId} className="text-xs font-bold text-[#2B211E] cursor-pointer block select-none">
          {label}
        </label>
        {description && <p className="text-[11px] text-[#756B66] select-none leading-relaxed">{description}</p>}
      </div>

      <button
        type="button"
        id={toggleId}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={clsx(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#C88A2B]/40 focus:ring-offset-2 focus:ring-offset-white",
          checked ? "bg-[#3B2522]" : "bg-[#E8E1D9]"
        )}
      >
        <span
          className={clsx(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
};
