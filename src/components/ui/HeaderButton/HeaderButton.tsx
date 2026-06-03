import type { ReactNode } from 'react';
import './HeaderButton.css';

interface HeaderButtonProps {
  /** Icon element (e.g. <CubeIcon />). Centered inside the button. */
  icon: ReactNode;
  onClick?: () => void;
  /** Native tooltip. */
  title?: string;
  /** Accessible name; falls back to `title`. */
  label?: string;
  /** Visually marks the button as the active tool. */
  active?: boolean;
}

/**
 * Square, rounded, dark-theme icon button for the header bar. The icon is
 * teal and glows on hover. Generic — pass any icon.
 */
export default function HeaderButton({
  icon,
  onClick,
  title,
  label,
  active = false,
}: HeaderButtonProps) {
  return (
    <button
      type="button"
      className={`tg-header-btn${active ? ' tg-header-btn--active' : ''}`}
      onClick={onClick}
      title={title}
      aria-label={label ?? title}
    >
      <span className="tg-header-btn__icon">{icon}</span>
    </button>
  );
}
