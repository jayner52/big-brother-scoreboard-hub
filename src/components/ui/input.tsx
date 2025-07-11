
import React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    // Handle number input clearing and default values
    const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (type === "number") {
        const value = e.target.value;
        // Allow empty string during editing
        if (value === "") {
          e.target.value = "";
        }
        // Call original onChange if provided
        if (props.onChange) {
          props.onChange(e);
        }
      } else if (props.onChange) {
        props.onChange(e);
      }
    };

    const handleNumberBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (type === "number") {
        const value = e.target.value;
        // Only set to 0 if empty AND there's no placeholder suggesting otherwise
        if (value === "" && !props.placeholder) {
          e.target.value = "0";
          // Trigger onChange to update the form state
          if (props.onChange) {
            const syntheticEvent = {
              ...e,
              target: { ...e.target, value: "0" }
            } as React.ChangeEvent<HTMLInputElement>;
            props.onChange(syntheticEvent);
          }
        }
        // Call original onBlur if provided
        if (props.onBlur) {
          props.onBlur(e);
        }
      } else if (props.onBlur) {
        props.onBlur(e);
      }
    };

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        onChange={handleNumberInput}
        onBlur={handleNumberBlur}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
