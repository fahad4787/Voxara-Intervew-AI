import {
  ButtonHTMLAttributes,
  forwardRef,
  type ReactNode,
} from "react";
import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "soft"
  | "ghost"
  | "danger"
  | "dangerGhost"
  | "accent";

export type ButtonSize = "sm" | "md" | "lg";

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 gap-2 px-3.5 text-sm",
  md: "h-11 gap-2 px-5 text-sm",
  lg: "h-12 gap-2.5 px-6 text-[15px]",
};

const iconOnlySizes: Record<ButtonSize, string> = {
  sm: "h-9 w-9",
  md: "h-11 w-11",
  lg: "h-12 w-12",
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "border-transparent bg-[var(--accent)] text-white hover:bg-[var(--accent-strong)]",
  secondary:
    "border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--ink)] hover:border-[var(--ink-faint)] hover:bg-[var(--surface-wash)]",
  soft: "border-transparent bg-[var(--accent-soft)] text-[var(--accent-strong)] hover:bg-[var(--accent-soft)]/80",
  ghost:
    "border-transparent bg-transparent text-[var(--ink-muted)] shadow-none hover:bg-[var(--surface-muted)] hover:text-[var(--ink)]",
  danger:
    "border-transparent bg-rose-600 text-white hover:bg-rose-700",
  dangerGhost:
    "border-transparent bg-transparent text-rose-600 shadow-none hover:bg-rose-50 hover:text-rose-700",
  accent:
    "border-transparent bg-[var(--ink)] text-white hover:bg-[var(--ink)]/90",
};

const recVariants: Record<
  ButtonVariant,
  { shell: string; fill: string; idle: string; active: string; spinner: string }
> = {
  primary: {
    shell:
      "border-[var(--border)] bg-[var(--surface-elevated)] shadow-[var(--shadow-soft)] hover:border-[var(--accent)]/25 hover:shadow-[var(--shadow-lift)]",
    fill: "bg-[var(--accent)]",
    idle: "text-[var(--ink)]",
    active: "text-white",
    spinner: "border-white/35 border-t-white",
  },
  secondary: {
    shell:
      "border-[var(--border)] bg-[var(--surface-wash)] shadow-[var(--shadow-soft)] hover:border-[var(--accent)]/20 hover:shadow-[var(--shadow-lift)]",
    fill: "bg-[var(--accent)]",
    idle: "text-[var(--ink)]",
    active: "text-white",
    spinner: "border-white/35 border-t-white",
  },
  soft: {
    shell:
      "border-transparent bg-[var(--accent-soft)] shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)]",
    fill: "bg-[var(--accent)]",
    idle: "text-[var(--accent-strong)]",
    active: "text-white",
    spinner: "border-white/35 border-t-white",
  },
  ghost: {
    shell:
      "border-transparent bg-transparent shadow-none hover:bg-[var(--surface-muted)]/60",
    fill: "bg-[var(--accent)]",
    idle: "text-[var(--ink-muted)]",
    active: "text-white",
    spinner: "border-white/35 border-t-white",
  },
  danger: {
    shell:
      "border-transparent bg-rose-600 text-white shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)]",
    fill: "bg-rose-800",
    idle: "text-white",
    active: "text-white",
    spinner: "border-white/35 border-t-white",
  },
  dangerGhost: {
    shell:
      "border-transparent bg-transparent shadow-none hover:bg-rose-50",
    fill: "bg-rose-600",
    idle: "text-rose-600",
    active: "text-white",
    spinner: "border-white/35 border-t-white",
  },
  accent: {
    shell:
      "border-transparent bg-[var(--accent)] text-white shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)]",
    fill: "bg-white",
    idle: "text-white",
    active: "text-[var(--accent-strong)]",
    spinner: "border-[var(--accent)]/30 border-t-[var(--accent)]",
  },
};

export type ButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> & {
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  href?: string;
  target?: string;
  rel?: string;
  leadingIcon?: LucideIcon;
  icon?: LucideIcon | null;
  iconOnly?: boolean;
  label?: string;
  /** Rec-dot expand animation */
  brand?: boolean;
};

const shellBase =
  "inline-flex items-center justify-center rounded-full border font-medium tracking-[-0.01em] transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] disabled:pointer-events-none disabled:opacity-45";

const recShellBase =
  "group/button relative inline-flex items-center justify-center overflow-hidden rounded-full border font-medium tracking-[-0.01em] transition-[box-shadow,border-color,background-color] duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] disabled:pointer-events-none disabled:opacity-45";

function Spinner({ className }: { className: string }) {
  return (
    <span
      className={cn(
        "inline-block h-3.5 w-3.5 animate-spin rounded-full border-2",
        className,
      )}
    />
  );
}

function PlainFace({
  children,
  loading,
  size,
  leadingIcon: LeadingIcon,
  icon: Icon,
  iconOnly,
  label,
}: {
  children?: ReactNode;
  loading?: boolean;
  size: ButtonSize;
  leadingIcon?: LucideIcon;
  icon?: LucideIcon | null;
  iconOnly?: boolean;
  label?: string;
}) {
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const text =
    loading
      ? "Please wait…"
      : label ?? (typeof children === "string" ? children : children);

  if (iconOnly) {
    const OnlyIcon = LeadingIcon;
    return loading ? (
      <Spinner className="border-current/25 border-t-current" />
    ) : OnlyIcon ? (
      <OnlyIcon className={iconSize} strokeWidth={2.25} />
    ) : null;
  }

  return (
    <>
      {loading ? (
        <Spinner className="border-current/25 border-t-current" />
      ) : LeadingIcon ? (
        <LeadingIcon className={cn(iconSize, "shrink-0")} strokeWidth={2.25} />
      ) : null}
      {text ? <span className="whitespace-nowrap leading-none">{text}</span> : null}
      {!loading && Icon ? (
        <Icon className={cn(iconSize, "shrink-0")} strokeWidth={2.25} />
      ) : null}
    </>
  );
}

function RecFace({
  children,
  loading,
  variant,
  size,
  leadingIcon: LeadingIcon,
  icon: Icon,
  iconOnly,
  label,
}: {
  children?: ReactNode;
  loading?: boolean;
  variant: ButtonVariant;
  size: ButtonSize;
  leadingIcon?: LucideIcon;
  icon?: LucideIcon | null;
  iconOnly?: boolean;
  label?: string;
}) {
  const v = recVariants[variant];
  const text =
    loading
      ? "Please wait…"
      : label ?? (typeof children === "string" ? children : children);
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  if (iconOnly) {
    const OnlyIcon = LeadingIcon;
    return (
      <>
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute left-1/2 top-1/2 z-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/button:scale-[70]",
            v.fill,
          )}
        />
        <span
          className={cn(
            "relative z-10 transition-opacity duration-200 ease-out group-hover/button:opacity-0",
            v.idle,
          )}
        >
          {loading ? (
            <Spinner className={v.spinner} />
          ) : OnlyIcon ? (
            <OnlyIcon className={iconSize} strokeWidth={2.25} />
          ) : null}
        </span>
        <span
          className={cn(
            "pointer-events-none absolute inset-0 z-10 flex items-center justify-center opacity-0 transition-opacity duration-300 delay-75 ease-out group-hover/button:opacity-100",
            v.active,
          )}
        >
          {loading ? (
            <Spinner className={v.spinner} />
          ) : OnlyIcon ? (
            <OnlyIcon className={iconSize} strokeWidth={2.25} />
          ) : null}
        </span>
      </>
    );
  }

  return (
    <>
      <span className="relative z-0 flex h-2 w-2 shrink-0 items-center justify-center">
        <span
          aria-hidden
          className={cn(
            "absolute inset-0 rounded-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/button:scale-[85]",
            v.fill,
          )}
        />
      </span>

      <span
        className={cn(
          "relative z-10 inline-flex items-center gap-2 transition-all duration-300 ease-out group-hover/button:translate-x-1.5 group-hover/button:opacity-0",
          v.idle,
        )}
      >
        {loading ? (
          <Spinner
            className={cn(
              v.spinner,
              "border-[var(--ink)]/20 border-t-[var(--ink)]",
            )}
          />
        ) : LeadingIcon ? (
          <LeadingIcon className={cn(iconSize, "shrink-0")} strokeWidth={2.25} />
        ) : null}
        <span className="whitespace-nowrap leading-none">{text}</span>
      </span>

      <span
        className={cn(
          "pointer-events-none absolute inset-0 z-10 flex items-center justify-center gap-2 opacity-0 transition-opacity duration-300 delay-100 ease-out group-hover/button:opacity-100",
          v.active,
        )}
      >
        <span className="whitespace-nowrap leading-none">{text}</span>
        {loading ? (
          <Spinner className={v.spinner} />
        ) : Icon ? (
          <Icon className={cn(iconSize, "shrink-0")} strokeWidth={2.4} />
        ) : null}
      </span>
    </>
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = "primary",
      size = "md",
      loading,
      disabled,
      type = "button",
      href,
      target,
      rel,
      leadingIcon,
      icon,
      iconOnly,
      label,
      brand = false,
      ...props
    },
    ref,
  ) => {
    const resolvedIcon = icon === undefined ? (brand ? ArrowRight : null) : icon;

    const classes = cn(
      brand ? recShellBase : shellBase,
      brand ? recVariants[variant].shell : variants[variant],
      iconOnly ? iconOnlySizes[size] : sizes[size],
      className,
    );

    const face = brand ? (
      <RecFace
        loading={loading}
        variant={variant}
        size={size}
        leadingIcon={leadingIcon}
        icon={resolvedIcon}
        iconOnly={iconOnly}
        label={label}
      >
        {children}
      </RecFace>
    ) : (
      <PlainFace
        loading={loading}
        size={size}
        leadingIcon={leadingIcon}
        icon={resolvedIcon}
        iconOnly={iconOnly}
        label={label}
      >
        {children}
      </PlainFace>
    );

    if (href) {
      return (
        <Link
          href={href}
          target={target}
          rel={rel}
          className={classes}
          aria-label={props["aria-label"]}
          aria-disabled={disabled || loading || undefined}
          tabIndex={disabled || loading ? -1 : undefined}
        >
          {face}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={classes}
        {...props}
      >
        {face}
      </button>
    );
  },
);

Button.displayName = "Button";
