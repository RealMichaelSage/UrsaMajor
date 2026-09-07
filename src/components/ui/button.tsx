import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost" | "dark";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = "",
      variant = "primary",
      size = "md",
      fullWidth = false,
      type = "button",
      disabled = false,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2";

    const variantStyles = {
      primary:
        "bg-[#f8173f] text-white hover:bg-[#dc1235] active:bg-[#c00e2d] shadow-sm hover:shadow",
      outline:
        "bg-white border border-[#f8173f] text-[#111111] hover:bg-[#f8173f] hover:text-white active:bg-[#dc1235]",
      ghost:
        "bg-transparent text-[#1a2e35] hover:bg-slate-100 active:bg-slate-200",
      dark:
        "bg-[#1a2e35] text-white hover:bg-[#111e23] active:bg-[#0c1518] shadow-sm",
    };

    const sizeStyles = {
      sm: "text-xs px-3.5 py-1.5 tracking-wider uppercase font-semibold",
      md: "text-sm px-5 py-2.5 tracking-wider uppercase font-semibold",
      lg: "text-base px-8 py-3.5 tracking-wider uppercase font-semibold",
    };

    const widthStyles = fullWidth ? "w-full" : "";

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
