import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-sm font-medium text-muted-foreground ml-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-2.5 bg-card border border-border rounded-xl
            text-foreground placeholder:text-muted-foreground
            focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
            transition-all duration-200 neon-glow-blue
            ${error ? "border-danger focus:ring-danger/50" : ""}
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-xs text-danger mt-1 ml-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
