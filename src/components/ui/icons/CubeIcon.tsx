interface CubeIconProps {
  size?: number;
  /** Rotation in degrees, applied around the icon's center. */
  rotate?: number;
  className?: string;
}

/**
 * Isometric cube outline. Uses `currentColor` so the stroke inherits the
 * button's text color (teal), and can be tilted via `rotate`.
 */
export function CubeIcon({ size = 22, rotate = 0, className }: CubeIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={rotate ? { transform: `rotate(${rotate}deg)` } : undefined}
      aria-hidden="true"
    >
      <path d="M12 2 L21 7 L21 17 L12 22 L3 17 L3 7 Z" />
      <path d="M3 7 L12 12 L21 7" />
      <path d="M12 12 L12 22" />
    </svg>
  );
}
