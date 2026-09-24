import React from "react";
import { clsx } from "clsx";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "amber" | "emerald" | "blue" | "rose" | "slate" | "purple" | "teal" | "gold" | "orange";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "amber",
  className,
}) => {
  const variants = {
    amber: "bg-[#FDF3E3] text-[#9E691A] border-[#F5D58A]",
    gold: "bg-[#F5E1C0] text-[#8A5B15] border-[#E5C992]",
    emerald: "bg-[#EAF5ED] text-[#276A42] border-[#B8E3C9]",
    blue: "bg-[#EBF3FA] text-[#2A587F] border-[#B5D3EC]",
    rose: "bg-[#FDE8E8] text-[#A82A2A] border-[#F7B6B6]",
    slate: "bg-[#FAF8F5] text-[#756B66] border-[#E8E1D9]",
    purple: "bg-[#F3EBF9] text-[#6B3B91] border-[#D6BBEB]",
    teal: "bg-[#E6F4F1] text-[#1E6C64] border-[#B0E2DC]",
    orange: "bg-[#FDF0E6] text-[#A84B15] border-[#F7CDAE]",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize tracking-tight",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
