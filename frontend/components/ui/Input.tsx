import React from "react";
import { LucideIcon } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  rightNode?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon: Icon, iconPosition = "left", className = "", rightNode, ...props }, ref) => {
    const iconBaseClasses = "absolute top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors";
    const iconLeftClasses = iconPosition === "left" ? "left-4" : "";
    const iconRightClasses = iconPosition === "right" ? "right-4" : "";

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-sm font-medium text-muted-foreground ml-1">
            {label}
          </label>
        )}
        <div className="relative group">
          {Icon && iconPosition === "left" && (
            <Icon className={`${iconBaseClasses} ${iconLeftClasses} group-focus-within:text-success`} />
          )}
          <input
            ref={ref}
            className={`
              w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl
              text-foreground placeholder:text-muted-foreground text-sm
              focus:outline-none focus:ring-2 focus:ring-success/50 focus:border-success
              transition-all duration-200
              ${Icon && iconPosition === "left" ? "pl-12" : ""}
              ${Icon && iconPosition === "right" || rightNode ? "pr-12" : ""}
              ${error ? "border-danger focus:ring-danger/50" : ""}
              ${className}
            `}
            {...props}
          />
          {rightNode && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {rightNode}
            </div>
          )}
          {Icon && iconPosition === "right" && !rightNode && (
            <Icon className={`${iconBaseClasses} ${iconRightClasses} group-focus-within:text-success`} />
          )}
        </div>
        {error && <p className="text-xs text-danger mt-1 ml-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
