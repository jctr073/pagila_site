import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import Icon, { type IconName } from "./Icon";
import { cn } from "./cn";

export type InputSize = "sm" | "md";

export type InputProps = {
  leftIcon?: IconName;
  rightSlot?: ReactNode;
  kbd?: string;
  size?: InputSize;
  wrapClassName?: string;
  wrapStyle?: React.CSSProperties;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "size">;

/**
 * Input — outer label.pa-input wraps the optional leading icon, the
 * <input>, and an optional kbd hint / right slot.
 *
 * Stateless on purpose: callers own the value. Mirrors designs/primitives.jsx#Input.
 */
const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    leftIcon,
    rightSlot,
    kbd,
    size = "md",
    className,
    wrapClassName,
    wrapStyle,
    ...rest
  },
  ref,
) {
  const iconSize = size === "sm" ? 12 : 14;
  return (
    <label
      className={cn("pa-input", wrapClassName)}
      data-size={size === "md" ? "" : size}
      style={wrapStyle}
    >
      {leftIcon && (
        <span className="pa-input-icon">
          <Icon name={leftIcon} size={iconSize} />
        </span>
      )}
      <input ref={ref} className={className} {...rest} />
      {kbd && <span className="pa-kbd">{kbd}</span>}
      {rightSlot}
    </label>
  );
});

export default Input;
