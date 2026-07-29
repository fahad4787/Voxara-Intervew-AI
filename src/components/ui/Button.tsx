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
  | "accent";

export type ButtonSize = "sm" | "md" | "lg";

/**
 * Voxara button
 * Idle: pill + brand “rec” dot + label
 * Hover: the dot expands into a full accent fill; white label + arrow fade in
 */
const sizes: Record<ButtonSize, string> = {
  sm: "h-9 gap-2 px-4 text-sm",
  md: "h-11 gap-2.5 px-5 text-sm",
  lg: "h-12 gap-3 px-6 text-[15px]",
};

const iconOnlySizes: Record<ButtonSize, string> = {
  sm: "h-9 w-9",
  md: "h-11 w-11",
  lg: "h-12 w-12",
};

const variants: Record<
  ButtonVariant,
  {
    shell: string;
    fill: string;
    idle: string;
    active: string;
    spinner: string;
  }
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
    shell: "border-transparent bg-transparent shadow-none hover:bg-[var(--surface-muted)]/60",
    fill: "bg-[var(--accent)]",
    idle: "text-[var(--ink-muted)]",
    active: "text-white",
    spinner: "border-white/35 border-t-white",
  },
  danger: {
    shell:
      "border-rose-200 bg-[var(--surface-elevated)] shadow-[var(--shadow-soft)] hover:border-rose-300 hover:shadow-[var(--shadow-lift)]",
    fill: "bg-rose-600",
    idle: "text-rose-700",
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
  /** Hover trailing icon — defaults to ArrowRight; pass null to hide */
  icon?: LucideIcon | null;
  iconOnly?: boolean;
  label?: string;
};

const shellBase =
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

function ButtonFace({
  children,
  loading,
  variant,
  size,
  leadingIcon: LeadingIcon,
  icon: Icon = ArrowRight,
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
  const v = variants[variant];
  const text =
    loading
      ? "Please wait…"
      : label ?? (typeof children === "string" ? children : children);
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  if (iconOnly) {
    const OnlyIcon = LeadingIcon ?? ArrowRight;
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
          ) : (
            <OnlyIcon className={iconSize} strokeWidth={2.25} />
          )}
        </span>
        <span
          className={cn(
            "pointer-events-none absolute inset-0 z-10 flex items-center justify-center opacity-0 transition-opacity duration-300 delay-75 ease-out group-hover/button:opacity-100",
            v.active,
          )}
        >
          {loading ? (
            <Spinner className={v.spinner} />
          ) : (
            <OnlyIcon className={iconSize} strokeWidth={2.25} />
          )}
        </span>
      </>
    );
  }

  return (
    <>
      {/* Brand fill — the small rec-dot grows into the pill */}
      <span className="relative z-0 flex h-2 w-2 shrink-0 items-center justify-center">
        <span
          aria-hidden
          className={cn(
            "absolute inset-0 rounded-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/button:scale-[85]",
            v.fill,
          )}
        />
      </span>

      {/* Idle content */}
      <span
        className={cn(
          "relative z-10 inline-flex items-center gap-2 transition-all duration-300 ease-out group-hover/button:translate-x-1.5 group-hover/button:opacity-0",
          v.idle,
        )}
      >
        {loading ? (
          <Spinner className={cn(v.spinner, "border-[var(--ink)]/20 border-t-[var(--ink)]")} />
        ) : LeadingIcon ? (
          <LeadingIcon className={cn(iconSize, "shrink-0")} strokeWidth={2.25} />
        ) : null}
        <span className="whitespace-nowrap leading-none">{text}</span>
      </span>

      {/* Hover content — sits on the expanded fill */}
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
      icon = ArrowRight,
      iconOnly,
      label,
      ...props
    },
    ref,
  ) => {
    const classes = cn(
      shellBase,
      variants[variant].shell,
      iconOnly ? iconOnlySizes[size] : sizes[size],
      className,
    );

    const face = (
      <ButtonFace
        loading={loading}
        variant={variant}
        size={size}
        leadingIcon={leadingIcon}
        icon={icon}
        iconOnly={iconOnly}
        label={label}
      >
        {children}
      </ButtonFace>
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
