interface IconProps {
  size?: number;
  /** Rotation in degrees, applied around the icon's center. */
  rotate?: number;
  className?: string;
}

/** Sphere outline (circle + equator) using `currentColor`. */
export function SphereIcon({ size = 22, rotate = 0, className }: IconProps) {
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
      <circle cx="12" cy="12" r="9" />
      <ellipse cx="12" cy="12" rx="9" ry="3.4" />
    </svg>
  );
}
