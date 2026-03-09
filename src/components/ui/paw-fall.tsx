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
    // 화면 전체에 고르게 분포 — 좌우 끝까지 포함
    const positions = [2, 10, 18, 28, 37, 48, 58, 67, 76, 85, 93, 98];
    const generated: Paw[] = positions.map((x, i) => ({
      id: i,
      x: x + (Math.random() * 4 - 2),       // 약간의 랜덤 오프셋
      size: 12 + Math.random() * 24,          // 12~36px
      opacity: 0.2 + Math.random() * 0.2,
      duration: 10 + Math.random() * 14,      // 10~24s
      delay: Math.random() * 4,               // 0~4s — 바로 시작
      sway: 10 + Math.random() * 30,
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
