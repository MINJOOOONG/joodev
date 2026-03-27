"use client";

import Link from "next/link";

interface ShelfCardProps {
  category: string;
  count: number;
  color: string;
  accent: string;
  desc: string;
}

export default function ShelfCard({ category, count, color, accent, desc }: ShelfCardProps) {
  return (
    <Link
      href={`/explore/${category.toLowerCase()}`}
      className="group relative overflow-hidden transition-transform duration-200 hover:-translate-y-1"
      style={{
        background: "#1e1a2e",
        border: `3px solid ${accent}`,
        boxShadow: `4px 4px 0 ${accent}88`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `6px 6px 0 ${accent}aa`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = `4px 4px 0 ${accent}88`;
      }}
    >
      {/* 픽셀 격자 텍스처 */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "4px 4px",
        }}
      />

      {/* Mini pixel books decoration */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-end gap-[3px] opacity-30 group-hover:opacity-50 transition-opacity duration-200">
        {Array.from({ length: Math.min(count, 6) }).map((_, i) => (
          <div
            key={i}
            style={{
              width: `${6 + (i % 3) * 2}px`,
              height: `${24 + (i % 4) * 8}px`,
              background: i % 2 === 0 ? color : accent,
              border: "1px solid rgba(0,0,0,0.2)",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 p-5 sm:p-6">
        {/* Category color dot + name */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-[10px] h-[10px] flex-shrink-0"
            style={{ background: color, boxShadow: `2px 2px 0 ${accent}` }}
          />
          <h2
            className="text-lg font-extrabold tracking-tight transition-colors duration-200"
            style={{ color }}
          >
            {category}
          </h2>
        </div>

        {/* Description */}
        <p className="mt-2 text-xs text-white/35 leading-relaxed max-w-[220px]">
          {desc}
        </p>

        {/* Book count badge */}
        <div className="mt-4 flex items-center gap-2">
          <span
            className="px-2 py-0.5 text-[11px] font-bold text-white"
            style={{ background: accent, boxShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}
          >
            {count} {count === 1 ? "book" : "books"}
          </span>
          <span
            className="text-[11px] font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            style={{ color }}
          >
            &rarr; GO!
          </span>
        </div>
      </div>
    </Link>
  );
}
