import React from "react";
import { clsx } from "clsx";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  className,
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-[#2B211E]">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && <div className="absolute left-3 text-[#756B66] pointer-events-none">{icon}</div>}
        <input
          id={inputId}
          className={clsx(
            "w-full bg-white border border-[#E8E1D9] rounded-lg px-3.5 py-2 text-sm text-[#2B211E] placeholder-[#9A918B] focus:outline-none focus:border-[#C88A2B] focus:ring-2 focus:ring-[#C88A2B]/20 transition-all duration-150",
            icon && "pl-9",
            error && "border-[#C94A4A] focus:ring-[#C94A4A]/20",
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-[#C94A4A] font-medium">{error}</p>}
    </div>
  );
};
