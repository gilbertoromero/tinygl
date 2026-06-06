import type { CSSProperties } from 'react';
import './SvgIcon.css';

interface SvgIconProps {
  /** SVG asset URL — import it: `import url from '.../foo.svg'`. */
  src: string;
  size?: number;
  /** Rotation in degrees, applied around the icon's center. */
  rotate?: number;
  className?: string;
  /** Accessible label. Omit for purely decorative icons. */
  title?: string;
}

/**
 * Renders an SVG asset as a themeable icon. The SVG is used as a CSS mask and
 * filled with `currentColor`, so the icon inherits the parent's text color
 * (teal in the header) and the hover glow — exactly like the hand-authored
 * inline icons. Use for any monochrome icon that lives in `assets/icons/`.
 */
export function SvgIcon({ src, size = 22, rotate = 0, className, title }: SvgIconProps) {
  return (
    <span
      className={`tg-svg-icon${className ? ` ${className}` : ''}`}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      style={
        {
          width: size,
          height: size,
          '--tg-svg-icon-src': `url("${src}")`,
          transform: rotate ? `rotate(${rotate}deg)` : undefined,
        } as CSSProperties
      }
    />
  );
}
