import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "red" | "slate" | "outline" | "neutral";
  size?: "sm" | "md";
}

export function Badge({
  children,
  className = "",
  variant = "slate",
  size = "sm",
  ...props
}: BadgeProps) {
  const base =
    "inline-flex items-center font-medium tracking-wider uppercase rounded-full transition-colors";

  const variants = {
    red: "bg-[#f8173f]/10 text-[#f8173f] border border-[#f8173f]/20",
    slate: "bg-[#1a2e35]/10 text-[#1a2e35] border border-[#1a2e35]/20",
    outline: "border border-gray-200 text-gray-700 bg-white",
    neutral: "bg-gray-100 text-gray-800",
  };

  const sizes = {
    sm: "text-[11px] px-2.5 py-0.5",
    md: "text-xs px-3 py-1",
  };

  return (
    <span
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
