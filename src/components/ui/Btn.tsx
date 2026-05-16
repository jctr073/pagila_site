import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import Icon, { type IconName } from "./Icon";
import { cn } from "./cn";

export type BtnVariant = "default" | "primary" | "ghost" | "danger-ghost";
export type BtnSize = "sm" | "md" | "lg";

export type BtnProps = {
  variant?: BtnVariant;
  size?: BtnSize;
  iconOnly?: boolean;
  leftIcon?: IconName;
  rightIcon?: IconName;
  children?: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * Btn — single source for buttons.
 *
 * Maps to .pa-btn (+ data-variant / data-size / data-icon-only) defined in
 * src/app/_design.css. Mirrors the API from designs/primitives.jsx#Btn.
 */
const Btn = forwardRef<HTMLButtonElement, BtnProps>(function Btn(
  {
    variant = "default",
    size = "md",
    iconOnly,
    leftIcon,
    rightIcon,
    children,
    className,
    type,
    ...rest
  },
  ref,
) {
  const iconSize = size === "sm" ? 12 : 14;
  return (
    <button
      ref={ref}
      // default to type="button" so a stray <Btn> inside a form doesn't
      // accidentally submit; callers can still pass type="submit"
      type={type ?? "button"}
      className={cn("pa-btn", className)}
      data-variant={variant === "default" ? "" : variant}
      data-size={size === "md" ? "" : size}
      data-icon-only={iconOnly ? "1" : ""}
      {...rest}
    >
      {leftIcon && <Icon name={leftIcon} size={iconSize} />}
      {children}
      {rightIcon && <Icon name={rightIcon} size={iconSize} />}
    </button>
  );
});

export default Btn;
