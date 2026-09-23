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
        "bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg transition-all duration-200 hover:border-slate-700/80",
        onClick && "cursor-pointer hover:translate-y-[-2px]",
        className
      )}
    >
      {children}
    </div>
  );
};
