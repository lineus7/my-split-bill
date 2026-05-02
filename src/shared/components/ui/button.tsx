import { cn } from "@/shared/lib/utils";
import { type ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
  isLoading?: boolean;
};

export function Button({
  variant = "primary",
  isLoading,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold",
        "transition-all duration-200",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" &&
          "bg-linear-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-700 hover:shadow-emerald-500/40 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none active:scale-[0.98]",
        variant === "secondary" &&
          "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500/20 focus:outline-none",
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="mr-2 h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : null}
      {children}
    </button>
  );
}
