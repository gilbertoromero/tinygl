import type { CSSProperties, ReactNode } from 'react';
import './UIButton.css';

interface UIButtonProps {
  /** Icon element (e.g. <SvgIcon src={…} />). The icon inherits the button's
   *  color via `currentColor`, so `iconColor`/`iconHighlightColor` tint it. */
  icon: ReactNode;
  onClick?: () => void;
  /** Native tooltip. */
  title?: string;
  /** Accessible name; falls back to `title`. */
  label?: string;
  /** Resting icon color (defaults to the close-button's dim color). */
  iconColor?: string;
  /** Border color (defaults to the control border color). */
  borderColor?: string;
  /** Icon color on hover (defaults to the strong text color). */
  iconHighlightColor?: string;
}

/**
 * Small square icon button built from the close-button chrome (`.tg-btn`), with
 * per-instance overrides for icon color, border color, and hover highlight color.
 * Overrides are passed as CSS custom properties so the `:hover` color can live
 * in the stylesheet rather than inline.
 */
export default function UIButton({
  icon,
  onClick,
  title,
  label,
  iconColor,
  borderColor,
  iconHighlightColor,
}: UIButtonProps) {
  return (
    <button
      type="button"
      className="tg-btn tg-uibtn"
      onClick={onClick}
      title={title}
      aria-label={label ?? title}
      style={
        {
          '--uib-icon': iconColor,
          '--uib-border': borderColor,
          '--uib-icon-hl': iconHighlightColor,
        } as CSSProperties
      }
    >
      {icon}
    </button>
  );
}
