import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "auth";
type ButtonSize = "sm" | "md" | "lg";

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
}

type AnchorProps = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children"> & {
    href: string;
  };

type NativeButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: undefined;
  };

export type ButtonProps = AnchorProps | NativeButtonProps;

function classes(
  variant: ButtonVariant,
  size: ButtonSize,
  className: string,
): string {
  const sizeClass = size === "lg" ? "btn-lg" : size === "sm" ? "btn-sm" : "";
  return ["btn", `btn-${variant}`, sizeClass, className]
    .filter(Boolean)
    .join(" ");
}

function passthroughRest(props: ButtonProps): Record<string, unknown> {
  const rest: Record<string, unknown> = { ...props };
  delete rest.variant;
  delete rest.size;
  delete rest.className;
  delete rest.children;
  return rest;
}

/**
 * Link or button styled as a button. Uses a real anchor when `href` is set
 * (navigation is navigation) and a real button for actions. All states —
 * hover, focus-visible, active, disabled — live in globals.css.
 */
export function Button(props: ButtonProps) {
  const { variant = "primary", size = "md", className = "", children } = props;
  const magnetic = variant === "ghost" ? {} : { "data-magnetic": "" };

  if ("href" in props && props.href !== undefined) {
    const rest = passthroughRest(props);
    delete rest.href;
    return (
      <a
        href={props.href}
        className={classes(variant, size, className)}
        {...magnetic}
        {...rest}
      >
        {children}
      </a>
    );
  }

  const rest = passthroughRest(props);
  return (
    <button
      type="button"
      className={classes(variant, size, className)}
      {...magnetic}
      {...rest}
    >
      {children}
    </button>
  );
}
