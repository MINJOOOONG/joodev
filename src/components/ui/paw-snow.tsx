"use client";

// CSS-only falling paw prints background
// Uses multiple animated elements with staggered delays for a snow-like effect
export default function PawSnow() {
  // 12 paws - enough for effect, light enough for performance
  const paws = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: `${(i * 8.3) % 100}%`,
    delay: `${(i * 1.7) % 8}s`,
    duration: `${8 + (i % 5) * 2}s`,
    size: 12 + (i % 3) * 4,
    opacity: 0.04 + (i % 3) * 0.015,
    rotate: (i * 37) % 360,
  }));

  return (
    <div className="paw-snow-container" aria-hidden="true">
      {paws.map((paw) => (
        <div
          key={paw.id}
          className="paw-snow-flake"
          style={{
            left: paw.left,
            animationDelay: paw.delay,
            animationDuration: paw.duration,
            opacity: paw.opacity,
          }}
        >
          <svg
            width={paw.size}
            height={paw.size}
            viewBox="0 0 24 24"
            fill="currentColor"
            className="text-gray-400"
            style={{ transform: `rotate(${paw.rotate}deg)` }}
          >
            <ellipse cx="12" cy="16.5" rx="6" ry="5" />
            <circle cx="6.5" cy="9.5" r="3" />
            <circle cx="12" cy="7" r="2.8" />
            <circle cx="17.5" cy="9.5" r="3" />
          </svg>
        </div>
      ))}
    </div>
  );
}
