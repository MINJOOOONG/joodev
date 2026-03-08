"use client";

import { useEffect, useState } from "react";

// Pixel-art style paw pad shape (SVG path)
function PawPad({ size, opacity }: { size: number; opacity: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="paw-pad-icon" opacity={opacity}>
      {/* Main pad */}
      <ellipse cx="12" cy="16" rx="5" ry="4" />
      {/* Toe pads */}
      <circle cx="7" cy="10" r="2.2" />
      <circle cx="11" cy="8" r="2.2" />
      <circle cx="15.5" cy="9" r="2" />
      <circle cx="18" cy="12" r="1.8" />
    </svg>
  );
}

interface Paw {
  id: number;
  x: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  sway: number;
  rotation: number;
}

export default function PawFall() {
  const [paws, setPaws] = useState<Paw[]>([]);

  useEffect(() => {
    const generated: Paw[] = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: 12 + Math.random() * 24,         // 12~36px — wide range for variety
      opacity: 0.2 + Math.random() * 0.2,
      duration: 10 + Math.random() * 14,      // 10~24s — noticeably faster
      delay: Math.random() * 18,
      sway: 15 + Math.random() * 50,
      rotation: Math.random() * 360,
    }));
    setPaws(generated);
  }, []);

  if (paws.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {paws.map((paw) => (
        <div
          key={paw.id}
          className="absolute paw-falling"
          style={{
            left: `${paw.x}%`,
            animationDuration: `${paw.duration}s`,
            animationDelay: `${paw.delay}s`,
            ["--paw-sway" as string]: `${paw.sway}px`,
          }}
        >
          <div style={{ transform: `rotate(${paw.rotation}deg)` }}>
            <PawPad
              size={paw.size}
              opacity={paw.opacity}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
