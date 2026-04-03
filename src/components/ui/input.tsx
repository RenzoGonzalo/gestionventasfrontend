import * as React from "react";
import { cn } from "../../lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "h-14 w-full rounded-xl border border-slate-300 bg-white px-4 text-lg outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/30",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
