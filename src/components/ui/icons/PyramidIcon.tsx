interface IconProps {
  size?: number;
  /** Rotation in degrees, applied around the icon's center. */
  rotate?: number;
  className?: string;
}

/** Square-base pyramid outline (apex + back edge) using `currentColor`. */
export function PyramidIcon({ size = 22, rotate = 0, className }: IconProps) {
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
      <path d="M12 3 L4 18 L20 18 Z" />
      <path d="M12 3 L12 13" />
      <path d="M12 13 L4 18" />
      <path d="M12 13 L20 18" />
    </svg>
  );
}
