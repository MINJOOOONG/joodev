interface CatIconProps {
  className?: string;
  size?: number;
}

// White pixel-art fat cat (뚱냥이) for header logo
// Light mode: subtle outline via CSS drop-shadow for visibility on white bg
export function PixelCat({ className = "", size = 32 }: CatIconProps) {
  // Each cell = 1px in a 16x16 grid, scaled up
  // Pure white (#fff) fat cat with dark eyes
  const W = "#ffffff";
  const E = "#141414"; // eye color
  const P = "#ffb8d0"; // pink nose/inner ear/blush
  const G = "#e0e0e0"; // belly lighter shade
  const B = "#ffe0ec"; // soft blush
  const T = "#ffd6e8"; // tail tip pink

  // 16x16 pixel grid rows (top to bottom)
  // . = empty, W = white, E = eye, P = pink, G = gray belly, B = blush, T = tail tip
  const rows: (string | null)[][] = [
    // row 0: ear tips
    [null,null, W,  null,null,null,null,null,null,null,null,null,null, W,  null,null],
    // row 1: ears
    [null, W,   W,   W,  null,null,null,null,null,null,null,null, W,   W,   W,  null],
    // row 2: ears (pink inner) + head start
    [null, W,   P,   W,   W,   W,   W,   W,   W,   W,   W,   W,   W,   P,   W,  null],
    // row 3: head
    [null, W,   W,   W,   W,   W,   W,   W,   W,   W,   W,   W,   W,   W,   W,  null],
    // row 4: eyes with highlight pixel
    [null, W,   W,   W,   E,   E,   W,   W,   W,   W,   E,   E,   W,   W,   W,  null],
    // row 5: cheeks (blush)
    [null, W,   W,   B,   W,   W,   W,   W,   W,   W,   W,   W,   B,   W,   W,  null],
    // row 6: nose + whisker dots
    [null, W,   E,   W,   W,   W,   W,   P,   P,   W,   W,   W,   W,   E,   W,  null],
    // row 7: mouth area
    [null, W,   W,   W,   W,   W,   W,   W,   W,   W,   W,   W,   W,   W,   W,  null],
    // row 8: body starts (FAT - wider)
    [ W,   W,   W,   W,   W,   W,   W,   W,   W,   W,   W,   W,   W,   W,   W,   W],
    // row 9: body with belly
    [ W,   W,   W,   W,   W,   G,   G,   G,   G,   G,   G,   W,   W,   W,   W,   W],
    // row 10: body with belly
    [ W,   W,   W,   W,   W,   G,   G,   G,   G,   G,   G,   W,   W,   W,   W,   W],
    // row 11: lower belly
    [ W,   W,   W,   W,   W,   W,   G,   G,   G,   G,   W,   W,   W,   W,   W,   W],
    // row 12: lower body
    [null, W,   W,   W,   W,   W,   W,   W,   W,   W,   W,   W,   W,   W,   W,  null],
    // row 13: feet + tail with paw pads
    [null,null, W,   P,   W,  null,null,null,null,null,null, W,   P,   W,  null, T],
    // row 14: feet + tail tip
    [null,null, W,   W,   W,  null,null,null,null,null,null, W,   W,   W,   T,  null],
  ];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 15"
      className={`pixel-cat-light ${className}`}
      shapeRendering="crispEdges"
    >
      {rows.map((row, y) =>
        row.map((cell, x) =>
          cell ? (
            <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={cell} />
          ) : null
        )
      )}
    </svg>
  );
}

// Claude-monster style cat face - round blob with big eyes
export function CatFace({ className = "", size = 28 }: CatIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
    >
      {/* Left ear - round nub */}
      <ellipse cx="16" cy="14" rx="9" ry="11" fill="currentColor" opacity="0.85" />
      <ellipse cx="16" cy="14" rx="5" ry="7" fill="#f0abfc" opacity="0.15" />
      {/* Right ear - round nub */}
      <ellipse cx="48" cy="14" rx="9" ry="11" fill="currentColor" opacity="0.85" />
      <ellipse cx="48" cy="14" rx="5" ry="7" fill="#f0abfc" opacity="0.15" />
      {/* Head - big round blob */}
      <circle cx="32" cy="36" r="25" fill="currentColor" />
      {/* Belly highlight */}
      <ellipse cx="32" cy="40" rx="16" ry="14" fill="white" opacity="0.06" />
      {/* Left eye - big round */}
      <circle cx="23" cy="33" r="7" fill="#141414" />
      <circle cx="25.5" cy="30.5" r="3" fill="white" opacity="0.9" />
      <circle cx="21" cy="34" r="1.5" fill="white" opacity="0.4" />
      {/* Right eye - big round */}
      <circle cx="41" cy="33" r="7" fill="#141414" />
      <circle cx="43.5" cy="30.5" r="3" fill="white" opacity="0.9" />
      <circle cx="39" cy="34" r="1.5" fill="white" opacity="0.4" />
      {/* Nose - tiny triangle-ish */}
      <path d="M30 42L32 40L34 42Z" fill="#f0abfc" opacity="0.7" />
      {/* Mouth - simple w shape */}
      <path d="M28 44Q30 46 32 44Q34 46 36 44" stroke="#f0abfc" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.5" />
      {/* Blush spots */}
      <circle cx="15" cy="39" r="4" fill="#f0abfc" opacity="0.1" />
      <circle cx="49" cy="39" r="4" fill="#f0abfc" opacity="0.1" />
    </svg>
  );
}

// Sleeping cat blob - Claude monster style curled up
export function SleepingCat({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <svg width="200" height="140" viewBox="0 0 200 140" fill="none">
        {/* Ground shadow */}
        <ellipse cx="95" cy="120" rx="65" ry="12" fill="#a78bfa" opacity="0.06" />
        {/* Tail - thick curly */}
        <path
          d="M145 90C158 85 168 74 162 60"
          stroke="#a78bfa"
          strokeWidth="10"
          strokeLinecap="round"
          opacity="0.2"
          fill="none"
        />
        {/* Body - big round blob */}
        <ellipse cx="95" cy="88" rx="58" ry="30" fill="#a78bfa" opacity="0.15" />
        {/* Body highlight */}
        <ellipse cx="90" cy="84" rx="40" ry="20" fill="#a78bfa" opacity="0.05" />
        {/* Head - round blob */}
        <circle cx="50" cy="72" r="26" fill="#a78bfa" opacity="0.2" />
        {/* Head highlight */}
        <circle cx="48" cy="68" r="16" fill="#a78bfa" opacity="0.05" />
        {/* Left ear - round nub */}
        <ellipse cx="34" cy="50" rx="8" ry="10" fill="#a78bfa" opacity="0.2" transform="rotate(-15 34 50)" />
        <ellipse cx="34" cy="50" rx="4.5" ry="6" fill="#f0abfc" opacity="0.06" transform="rotate(-15 34 50)" />
        {/* Right ear - round nub */}
        <ellipse cx="62" cy="48" rx="8" ry="10" fill="#a78bfa" opacity="0.2" transform="rotate(15 62 48)" />
        <ellipse cx="62" cy="48" rx="4.5" ry="6" fill="#f0abfc" opacity="0.06" transform="rotate(15 62 48)" />
        {/* Closed eyes - happy curves */}
        <path d="M38 70C40 66 46 66 48 70" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.45" />
        <path d="M54 69C56 65 62 65 64 69" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.45" />
        {/* Nose */}
        <path d="M49 75L51 73.5L53 75Z" fill="#f0abfc" opacity="0.3" />
        {/* Tiny smile */}
        <path d="M47 77Q50 79 53 77" stroke="#f0abfc" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.25" />
        {/* Blush */}
        <circle cx="36" cy="74" r="4" fill="#f0abfc" opacity="0.06" />
        <circle cx="66" cy="73" r="4" fill="#f0abfc" opacity="0.06" />
        {/* Zzz - floating */}
        <text x="82" y="42" fontSize="18" fill="#a78bfa" opacity="0.35" fontWeight="700" fontFamily="monospace">z</text>
        <text x="96" y="30" fontSize="14" fill="#a78bfa" opacity="0.25" fontWeight="700" fontFamily="monospace">z</text>
        <text x="106" y="20" fontSize="11" fill="#a78bfa" opacity="0.15" fontWeight="700" fontFamily="monospace">z</text>
      </svg>
    </div>
  );
}

// Hero cat - big Claude-monster blob with personality
export function HeroCat({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 240" fill="none" className={className}>
      {/* Ambient glow */}
      <circle cx="120" cy="125" r="80" fill="#a78bfa" opacity="0.04" />
      <circle cx="120" cy="125" r="55" fill="#a78bfa" opacity="0.03" />

      {/* Left ear - chunky round */}
      <ellipse cx="68" cy="52" rx="18" ry="24" fill="#a78bfa" opacity="0.25" transform="rotate(-10 68 52)" />
      <ellipse cx="68" cy="52" rx="10" ry="15" fill="#f0abfc" opacity="0.08" transform="rotate(-10 68 52)" />
      {/* Right ear - chunky round */}
      <ellipse cx="172" cy="52" rx="18" ry="24" fill="#a78bfa" opacity="0.25" transform="rotate(10 172 52)" />
      <ellipse cx="172" cy="52" rx="10" ry="15" fill="#f0abfc" opacity="0.08" transform="rotate(10 172 52)" />

      {/* Body/Head - one big friendly blob */}
      <ellipse cx="120" cy="135" rx="70" ry="65" fill="#a78bfa" opacity="0.18" />
      {/* Face area */}
      <circle cx="120" cy="115" r="52" fill="#a78bfa" opacity="0.22" />
      {/* Belly highlight */}
      <ellipse cx="120" cy="150" rx="42" ry="30" fill="#a78bfa" opacity="0.04" />
      {/* Face highlight */}
      <ellipse cx="118" cy="110" rx="35" ry="30" fill="white" opacity="0.03" />

      {/* Left eye - BIG expressive */}
      <circle cx="97" cy="108" r="16" fill="#141414" />
      {/* Eye iris glow */}
      <circle cx="97" cy="110" r="10" fill="#a78bfa" opacity="0.2" />
      {/* Highlights */}
      <circle cx="102" cy="103" r="6" fill="white" opacity="0.85" />
      <circle cx="93" cy="112" r="3" fill="white" opacity="0.35" />

      {/* Right eye - BIG expressive */}
      <circle cx="143" cy="108" r="16" fill="#141414" />
      {/* Eye iris glow */}
      <circle cx="143" cy="110" r="10" fill="#a78bfa" opacity="0.2" />
      {/* Highlights */}
      <circle cx="148" cy="103" r="6" fill="white" opacity="0.85" />
      <circle cx="139" cy="112" r="3" fill="white" opacity="0.35" />

      {/* Nose - cute triangle */}
      <path d="M116 130L120 126L124 130Z" fill="#f0abfc" opacity="0.55" />

      {/* Mouth - happy w */}
      <path d="M110 135Q115 140 120 135Q125 140 130 135" stroke="#f0abfc" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.35" />

      {/* Blush spots */}
      <ellipse cx="78" cy="120" rx="10" ry="6" fill="#f0abfc" opacity="0.08" />
      <ellipse cx="162" cy="120" rx="10" ry="6" fill="#f0abfc" opacity="0.08" />

      {/* Little arms/paws reaching out */}
      <ellipse cx="72" cy="165" rx="12" ry="8" fill="#a78bfa" opacity="0.15" transform="rotate(-20 72 165)" />
      <ellipse cx="168" cy="165" rx="12" ry="8" fill="#a78bfa" opacity="0.15" transform="rotate(20 168 165)" />

      {/* Feet */}
      <ellipse cx="95" cy="195" rx="14" ry="8" fill="#a78bfa" opacity="0.12" />
      <ellipse cx="145" cy="195" rx="14" ry="8" fill="#a78bfa" opacity="0.12" />
    </svg>
  );
}
