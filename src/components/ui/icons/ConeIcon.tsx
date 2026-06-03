interface IconProps {
  size?: number;
  /** Rotation in degrees, applied around the icon's center. */
  rotate?: number;
  className?: string;
}

/** Cone outline (apex + elliptical base) using `currentColor`. */
export function ConeIcon({ size = 22, rotate = 0, className }: IconProps) {
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
      <ellipse cx="12" cy="18" rx="7" ry="2.6" />
      <path d="M5 18 L12 3 L19 18" />
    </svg>
  );
}
