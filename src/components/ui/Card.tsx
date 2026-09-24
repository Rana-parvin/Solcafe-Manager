import React from "react";
import { clsx } from "clsx";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "bg-white border border-[#E8E1D9] rounded-2xl p-5 md:p-6 shadow-sm transition-all duration-200 hover:border-[#D8CEC5] hover:shadow-md",
        onClick && "cursor-pointer hover:translate-y-[-2px]",
        className
      )}
    >
      {children}
    </div>
  );
};
