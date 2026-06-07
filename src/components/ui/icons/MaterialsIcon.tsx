import { useId } from 'react';

interface IconProps {
  size?: number;
  /** Rotation in degrees, applied around the icon's center. */
  rotate?: number;
  className?: string;
}

/**
 * Shaded "material preview ball": a 3D-looking sphere lit from the upper-left.
 * The base fill uses `currentColor` so it tints to the button's theme (teal); a
 * white radial highlight and a dark bottom gradient fake the lighting. Unlike the
 * other header icons (flat outlines), this is a filled, shaded image.
 *
 * Gradient ids are made unique per instance so several balls can render on the
 * same page (the Materials menu) without colliding on `url(#id)` references.
 */
export function MaterialsIcon({ size = 22, rotate = 0, className }: IconProps) {
  const uid = useId().replace(/:/g, ''); // colons are invalid in url(#...) refs
  const lightId = `tg-mat-light-${uid}`;
  const shadeId = `tg-mat-shade-${uid}`;

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={rotate ? { transform: `rotate(${rotate}deg)` } : undefined}
      aria-hidden="true"
    >
      <defs>
        {/* Highlight: bright spot upper-left fading out. */}
        <radialGradient id={lightId} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="35%" stopColor="#ffffff" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        {/* Shadow: terminator + lower-right falloff for roundness. */}
        <radialGradient id={shadeId} cx="68%" cy="72%" r="70%">
          <stop offset="55%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.55" />
        </radialGradient>
      </defs>

      {/* Base sphere, tinted to the current color. */}
      <circle cx="12" cy="12" r="9.5" fill="currentColor" />
      {/* Shading layers. */}
      <circle cx="12" cy="12" r="9.5" fill={`url(#${shadeId})`} />
      <circle cx="12" cy="12" r="9.5" fill={`url(#${lightId})`} />
      {/* Tiny specular dot. */}
      <circle cx="8.6" cy="8.2" r="1.5" fill="#ffffff" fillOpacity="0.9" />
    </svg>
  );
}
