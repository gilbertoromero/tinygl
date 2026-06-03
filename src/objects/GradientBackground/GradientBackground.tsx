import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { CanvasTexture, SRGBColorSpace } from 'three';

export type GradientStyle =
  | 'radial-center-out'
  | 'radial-out-center'
  | 'linear-top-bottom'
  | 'linear-bottom-top'
  | 'linear-left-right'
  | 'linear-right-left';

interface GradientBackgroundProps {
  innerColor?: string;
  outerColor?: string;
  style?: GradientStyle;
}

const GradientBackground = ({
  innerColor = '#5a5a5a',
  outerColor = '#111111',
  style = 'radial-center-out',
}: GradientBackgroundProps) => {
  const { scene, size } = useThree();

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = size.width;
    canvas.height = size.height;
    const ctx = canvas.getContext('2d')!;

    const w = size.width;
    const h = size.height;

    let gradient: CanvasGradient;
    switch (style) {
      case 'radial-out-center': {
        const cx = w / 2;
        const cy = h / 2;
        const r = Math.sqrt(cx * cx + cy * cy);
        gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        gradient.addColorStop(0, outerColor);
        gradient.addColorStop(1, innerColor);
        break;
      }
      case 'linear-top-bottom': {
        gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, innerColor);
        gradient.addColorStop(1, outerColor);
        break;
      }
      case 'linear-bottom-top': {
        gradient = ctx.createLinearGradient(0, h, 0, 0);
        gradient.addColorStop(0, innerColor);
        gradient.addColorStop(1, outerColor);
        break;
      }
      case 'linear-left-right': {
        gradient = ctx.createLinearGradient(0, 0, w, 0);
        gradient.addColorStop(0, innerColor);
        gradient.addColorStop(1, outerColor);
        break;
      }
      case 'linear-right-left': {
        gradient = ctx.createLinearGradient(w, 0, 0, 0);
        gradient.addColorStop(0, innerColor);
        gradient.addColorStop(1, outerColor);
        break;
      }
      case 'radial-center-out':
      default: {
        const cx = w / 2;
        const cy = h / 2;
        const r = Math.sqrt(cx * cx + cy * cy);
        gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        gradient.addColorStop(0, innerColor);
        gradient.addColorStop(1, outerColor);
        break;
      }
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    scene.background = texture;

    return () => {
      texture.dispose();
      scene.background = null;
    };
  }, [scene, size.width, size.height, innerColor, outerColor, style]);

  return null;
};

export default GradientBackground;
