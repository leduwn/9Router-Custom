"use client";

import { cn } from "@/shared/utils/cn";

const variants = {
  primary: "border border-brand-400/30 bg-linear-to-b from-brand-400 to-brand-600 text-white shadow-[0_10px_24px_-14px_rgba(33,136,255,0.9)] hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[0_14px_28px_-14px_rgba(33,136,255,0.95)] disabled:border-transparent disabled:bg-surface-3 disabled:text-text-muted disabled:shadow-none",
  secondary: "border border-border bg-surface text-text-main shadow-[var(--shadow-soft)] hover:-translate-y-0.5 hover:border-brand-500/25 hover:bg-surface-2 disabled:opacity-50",
  outline: "border border-border bg-transparent text-text-main hover:-translate-y-0.5 hover:border-brand-500/40 hover:bg-brand-500/5",
  ghost: "text-text-muted hover:bg-surface-2 hover:text-text-main",
  danger: "border border-red-400/20 bg-red-500 text-white shadow-sm hover:-translate-y-0.5 hover:bg-red-600 disabled:bg-surface-3 disabled:text-text-muted",
  success: "border border-green-400/20 bg-green-600 text-white shadow-sm hover:-translate-y-0.5 hover:bg-green-700 disabled:bg-surface-3 disabled:text-text-muted",
};

const sizes = {
  sm: "h-7 px-3 text-xs rounded-[8px]",
  md: "h-9 px-4 text-sm rounded-[10px]",
  lg: "h-11 px-6 text-sm rounded-[10px]",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  disabled = false,
  loading = false,
  fullWidth = false,
  className,
  ...props
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 ease-out cursor-pointer",
        "focus-visible:ring-0 active:translate-y-px active:scale-[0.985] disabled:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
      ) : icon ? (
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
      ) : null}
      {children}
      {iconRight && !loading && (
        <span className="material-symbols-outlined text-[18px]">{iconRight}</span>
      )}
    </button>
  );
}
