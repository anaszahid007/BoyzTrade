import React from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  isLoading?: boolean;
  loader?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  isLoading,
  loader = true,
  className = "",
  disabled,
  ...props
}) => {
  const variants = {
    primary: "bg-success text-white hover:bg-success/90 hover:drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]",
    secondary: "bg-transparent text-success hover:bg-success/80 hover:drop-shadow-[0_0_15px_rgba(16,185,129,0.5)] hover:text-white border border-success",
    danger: "bg-red-600 text-white hover:bg-red-600/90 neon-glow-red",
    ghost: "bg-transparent hover:bg-secondary text-white hover:text-foreground",
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`
        relative px-6 py-3 rounded-2xl font-bold transition-all duration-200
        flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {isLoading && loader ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        children
      )}
    </button>
  );
};
