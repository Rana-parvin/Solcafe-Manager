import React from "react";
import { clsx } from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline" | "gold";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  className,
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#C88A2B]/40 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

  const variants = {
    primary: "bg-[#3B2522] hover:bg-[#241614] text-white font-semibold shadow-sm border border-[#241614]",
    secondary: "bg-white hover:bg-[#FAF8F5] text-[#2B211E] border border-[#D8CEC5] shadow-xs",
    danger: "bg-[#C94A4A] hover:bg-[#B33E3E] text-white font-semibold shadow-xs",
    ghost: "bg-transparent hover:bg-[#FAF8F5] text-[#756B66] hover:text-[#2B211E]",
    outline: "bg-transparent border border-[#3B2522] text-[#3B2522] hover:bg-[#FAF8F5]",
    gold: "bg-[#C88A2B] hover:bg-[#B57B23] text-white font-semibold shadow-sm",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5 rounded-lg",
    md: "px-4 py-2 text-sm gap-2 rounded-lg",
    lg: "px-5 py-2.5 text-base gap-2.5 rounded-xl",
  };

  return (
    <button
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin h-4 w-4 text-current shrink-0" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
};
