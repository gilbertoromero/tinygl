import { useEffect, useRef, useState } from 'react';
import type * as THREE from 'three';
import './index.css';

export interface DebugOverlayProps {
  renderer?: THREE.WebGLRenderer | null;
}

interface Stats {
  fps: number;
  frameMs: number;
  memUsedMB: number | null;
  memLimitMB: number | null;
  calls: number | null;
  triangles: number | null;
  geometries: number | null;
  textures: number | null;
}

const EMPTY: Stats = {
  fps: 0,
  frameMs: 0,
  memUsedMB: null,
  memLimitMB: null,
  calls: null,
  triangles: null,
  geometries: null,
  textures: null,
};

export default function DebugOverlay({ renderer }: DebugOverlayProps) {
  const [stats, setStats] = useState<Stats>(EMPTY);
  const frameCount = useRef(0);
  const lastFlush = useRef(performance.now());
  const lastFrame = useRef(performance.now());
  const rafId = useRef(0);

  useEffect(() => {
    const tick = () => {
      const now = performance.now();
      const frameMs = now - lastFrame.current;
      lastFrame.current = now;
      frameCount.current++;

      if (now - lastFlush.current >= 500) {
        const elapsed = now - lastFlush.current;
        const fps = (frameCount.current / elapsed) * 1000;
        const mem = (
          performance as { memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number } }
        ).memory;
        const info = renderer?.info;

        setStats({
          fps: Math.round(fps),
          frameMs: Math.round(frameMs * 10) / 10,
          memUsedMB: mem ? Math.round(mem.usedJSHeapSize / 1_048_576) : null,
          memLimitMB: mem ? Math.round(mem.jsHeapSizeLimit / 1_048_576) : null,
          calls: info?.render.calls ?? null,
          triangles: info?.render.triangles ?? null,
          geometries: info?.memory.geometries ?? null,
          textures: info?.memory.textures ?? null,
        });

        frameCount.current = 0;
        lastFlush.current = now;
      }

      rafId.current = requestAnimationFrame(tick);
    };

    rafId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId.current);
  }, [renderer]);

  const fpsColor = stats.fps >= 55 ? '#00ff88' : stats.fps >= 30 ? '#ffcc00' : '#ff4444';

  return (
    <div className="dbg-overlay">
      <p className="dbg-title">PERF</p>

      <Row label="FPS" value={<span style={{ color: fpsColor }}>{stats.fps}</span>} />
      <Row label="Frame" value={`${stats.frameMs} ms`} />

      {stats.memUsedMB !== null && (
        <Row label="Mem" value={`${stats.memUsedMB} / ${stats.memLimitMB} MB`} />
      )}

      {renderer && (
        <>
          <p className="dbg-section">RENDERER</p>
          <Row label="Draw calls" value={stats.calls} />
          <Row label="Triangles" value={stats.triangles?.toLocaleString()} />
          <Row label="Geometries" value={stats.geometries} />
          <Row label="Textures" value={stats.textures} />
        </>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="dbg-row">
      <span className="dbg-label">{label}</span>
      <span className="dbg-value">{value ?? '—'}</span>
    </div>
  );
}
