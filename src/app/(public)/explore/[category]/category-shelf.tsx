"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

/* ─── Types ─── */
interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverUrl: string | null;
  publishedAt: string | null;
  createdAt: string;
  tags: { name: string }[];
}

/* ─── Pixel-style category colors (선명한 도트 느낌) ─── */
const CAT_COLORS: Record<string, { bg: string; spine: string; accent: string }> = {
  Backend:     { bg: "#5B8DEF", spine: "#4A73C9", accent: "#3D5FA3" },
  Frontend:    { bg: "#4DD4C0", spine: "#3BB5A4", accent: "#2E9586" },
  QA:          { bg: "#6BCB77", spine: "#55AD62", accent: "#43904F" },
  DevOps:      { bg: "#F09D51", spine: "#D48642", accent: "#B87036" },
  Review:      { bg: "#A78BFA", spine: "#8B6FDE", accent: "#7058B8" },
  Experiences: { bg: "#F7C948", spine: "#DAB03C", accent: "#BD9832" },
  Daily:       { bg: "#F472B6", spine: "#D45D9C", accent: "#B44B82" },
};
const DEFAULT_COLORS = { bg: "#9CA3AF", spine: "#7E8694", accent: "#656C78" };

function getColors(cat: string) { return CAT_COLORS[cat] ?? DEFAULT_COLORS; }

function fmtDate(s: string) {
  const d = new Date(s);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function stripEmoji(s: string) {
  return s.replace(/\s*[^\w\sㄱ-ㅎㅏ-ㅣ가-힣a-zA-Z0-9·\-(),.!?]/g, "").trim();
}

/* ─── Pixel shadow helper (계단식 그림자) ─── */
function pixelShadow(color: string, hover = false) {
  const base = `
    2px 2px 0 ${color},
    4px 4px 0 rgba(0,0,0,0.25)
  `;
  const hovered = `
    2px 2px 0 ${color},
    4px 4px 0 ${color}88,
    6px 6px 0 rgba(0,0,0,0.2)
  `;
  return hover ? hovered : base;
}

/* ═══════════════════════════════════════════════════════
   CoverBook — 표지 있는 책 (픽셀 스타일)
   ═══════════════════════════════════════════════════════ */

function CoverBook({ post, colors }: { post: Post; colors: { bg: string; spine: string; accent: string } }) {
  const [h, setH] = useState(false);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="relative flex-shrink-0 cursor-pointer group"
      style={{ width: 140, paddingLeft: 14 }}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
    >
      <div
        className="relative transition-transform duration-200 ease-out"
        style={{ transform: h ? "translateY(-14px)" : "translateY(0)" }}
      >
        {/* ── Spine (픽셀 느낌 — 직각) ── */}
        <div
          className="absolute left-0 top-0 bottom-0 z-10"
          style={{
            width: 16,
            background: colors.spine,
            borderRight: `2px solid ${colors.accent}`,
            boxShadow: `inset 2px 0 0 rgba(255,255,255,0.2), inset -1px 0 0 rgba(0,0,0,0.15)`,
          }}
        >
          {/* 스파인 도트 장식 */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col gap-[3px]">
            <div className="w-[4px] h-[4px] bg-white/30" />
            <div className="w-[4px] h-[4px] bg-white/20" />
          </div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col gap-[3px]">
            <div className="w-[4px] h-[4px] bg-white/20" />
            <div className="w-[4px] h-[4px] bg-white/30" />
          </div>
        </div>

        {/* ── Front cover ── */}
        <div
          className="relative overflow-hidden ml-[14px] transition-shadow duration-200"
          style={{
            width: 122,
            height: 176,
            border: `3px solid ${colors.accent}`,
            boxShadow: pixelShadow(colors.accent, h),
          }}
        >
          <Image
            src={post.coverUrl!}
            alt={post.title}
            fill
            className="object-cover"
            sizes="122px"
          />
          {/* 픽셀 격자 오버레이 */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.06]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0,0,0,0.5) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,0.5) 1px, transparent 1px)
              `,
              backgroundSize: "4px 4px",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

          {/* Title bar (하단 픽셀 라벨) */}
          <div
            className="absolute bottom-0 inset-x-0 px-2 py-2"
            style={{ background: `${colors.accent}dd` }}
          >
            <p className="text-[10px] font-bold text-white leading-snug line-clamp-2" style={{ fontFamily: "inherit" }}>
              {post.title}
            </p>
            <p className="mt-1 text-[8px] text-white/50 font-mono">
              {fmtDate(post.publishedAt ?? post.createdAt)}
            </p>
          </div>
        </div>

        {/* ── Page edge (오른쪽 — 계단식) ── */}
        <div
          className="absolute top-[3px] bottom-[3px] z-0"
          style={{
            right: -3,
            width: 5,
            background: `repeating-linear-gradient(
              180deg,
              #e8e4df 0px,
              #ddd8d2 2px,
              #e8e4df 4px
            )`,
            borderRight: "1px solid rgba(0,0,0,0.1)",
          }}
        />
      </div>
    </Link>
  );
}

/* ═══════════════════════════════════════════════════════
   SpineBook — 표지 없는 책 (픽셀 도트 책등)
   ═══════════════════════════════════════════════════════ */

function SpineBook({ post, colors }: { post: Post; colors: { bg: string; spine: string; accent: string } }) {
  const [h, setH] = useState(false);
  const title = stripEmoji(post.title);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="relative flex-shrink-0 cursor-pointer group"
      style={{ width: 48 }}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
    >
      <div
        className="relative transition-transform duration-200 ease-out"
        style={{ transform: h ? "translateY(-14px)" : "translateY(0)" }}
      >
        {/* ── Main body ── */}
        <div
          className="relative overflow-hidden transition-shadow duration-200"
          style={{
            width: 48,
            height: 176,
            background: colors.bg,
            border: `3px solid ${colors.accent}`,
            boxShadow: pixelShadow(colors.accent, h),
          }}
        >
          {/* 픽셀 격자 텍스처 */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.06]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0,0,0,0.4) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,0.4) 1px, transparent 1px)
              `,
              backgroundSize: "4px 4px",
            }}
          />

          {/* ── Left binding ── */}
          <div
            className="absolute left-0 top-0 bottom-0"
            style={{
              width: 5,
              background: colors.accent,
              boxShadow: "inset -1px 0 0 rgba(255,255,255,0.15)",
            }}
          />

          {/* ── 상단 도트 장식 ── */}
          <div className="absolute top-[10px] left-1/2 -translate-x-1/2 flex gap-[2px]">
            <div className="w-[4px] h-[4px] bg-white/40" />
            <div className="w-[4px] h-[4px] bg-white/25" />
            <div className="w-[4px] h-[4px] bg-white/40" />
          </div>

          {/* ── 하단 도트 장식 ── */}
          <div className="absolute bottom-[10px] left-1/2 -translate-x-1/2 flex gap-[2px]">
            <div className="w-[4px] h-[4px] bg-white/25" />
            <div className="w-[4px] h-[4px] bg-white/40" />
            <div className="w-[4px] h-[4px] bg-white/25" />
          </div>

          {/* ── 가운데 띠 장식 ── */}
          <div
            className="absolute left-[7px] right-[3px]"
            style={{ top: "50%", transform: "translateY(-50%)", height: 6, background: "rgba(255,255,255,0.15)" }}
          />

          {/* ── Page edge (오른쪽) ── */}
          <div
            className="absolute right-0 top-[3px] bottom-[3px]"
            style={{
              width: 4,
              background: `repeating-linear-gradient(
                180deg,
                #e8e4df 0px,
                #ddd8d2 2px,
                #e8e4df 4px
              )`,
            }}
          />

          {/* ── Vertical title ── */}
          <div className="absolute inset-0 flex items-center justify-center" style={{ left: 8, right: 5 }}>
            <p
              className="select-none font-bold transition-colors duration-200"
              style={{
                writingMode: "vertical-rl",
                textOrientation: "mixed",
                fontSize: 9,
                lineHeight: 1.3,
                letterSpacing: "0.05em",
                color: h ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.65)",
                maxHeight: 130,
                overflow: "hidden",
              }}
            >
              {title.slice(0, 12)}
            </p>
          </div>
        </div>
      </div>

      {/* ─── Hover tooltip ─── */}
      <div
        className="absolute -top-3 left-1/2 z-30 pointer-events-none transition-all duration-200 w-52"
        style={{
          opacity: h ? 1 : 0,
          transform: h
            ? "translateX(-50%) translateY(-100%)"
            : "translateX(-50%) translateY(calc(-100% + 6px))",
        }}
      >
        <div
          className="px-3 py-2.5"
          style={{
            background: "#2a2235",
            border: `3px solid ${colors.accent}`,
            boxShadow: `3px 3px 0 ${colors.accent}88`,
          }}
        >
          <p className="text-[11px] font-bold text-white leading-snug line-clamp-2">{post.title}</p>
          {post.excerpt && (
            <p className="mt-1 text-[9px] text-white/50 leading-relaxed line-clamp-2">{post.excerpt}</p>
          )}
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-[8px] text-white/35 font-mono">{fmtDate(post.publishedAt ?? post.createdAt)}</span>
            {post.tags.length > 0 && (
              <div className="flex gap-1">
                {post.tags.slice(0, 2).map((t) => (
                  <span
                    key={t.name}
                    className="px-1 py-0.5 text-[7px] font-bold text-white/70"
                    style={{ background: colors.accent }}
                  >
                    {t.name}
                  </span>
                ))}
              </div>
            )}
          </div>
          {/* 아래 화살표 (픽셀) */}
          <div
            className="absolute -bottom-[8px] left-1/2 -translate-x-1/2"
            style={{
              width: 0,
              height: 0,
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderTop: `8px solid ${colors.accent}`,
            }}
          />
        </div>
      </div>
    </Link>
  );
}

/* ═══════════════════════════════════════════════════════
   ShelfPlank — 픽셀 나무 책장 판자
   ═══════════════════════════════════════════════════════ */
function ShelfPlank() {
  return (
    <div className="relative mt-0">
      {/* 판자 윗면 */}
      <div
        style={{
          height: 8,
          background: "#8B6F47",
          borderTop: "2px solid #A0835A",
          boxShadow: "inset 0 -2px 0 #7A6040",
        }}
      />
      {/* 판자 앞면 */}
      <div
        style={{
          height: 12,
          background: "#7A6040",
          borderBottom: "2px solid #5C4830",
          boxShadow: "0 4px 0 rgba(0,0,0,0.2)",
        }}
      >
        {/* 나무결 도트 패턴 */}
        <div
          className="w-full h-full opacity-20"
          style={{
            backgroundImage: `repeating-linear-gradient(
              90deg,
              transparent 0px,
              transparent 8px,
              rgba(255,255,255,0.15) 8px,
              rgba(255,255,255,0.15) 10px
            )`,
          }}
        />
      </div>
      {/* 밑 그림자 */}
      <div
        style={{
          height: 6,
          background: "linear-gradient(180deg, rgba(0,0,0,0.12), transparent)",
        }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   PixelStar — 반짝이는 별 장식
   ═══════════════════════════════════════════════════════ */
function PixelStar({ x, y, delay }: { x: string; y: string; delay: string }) {
  return (
    <div
      className="absolute pointer-events-none animate-pulse"
      style={{ left: x, top: y, animationDelay: delay, animationDuration: "2s" }}
    >
      <div className="relative">
        <div className="w-[3px] h-[3px] bg-yellow-300/60" />
        <div className="absolute -top-[3px] left-0 w-[3px] h-[3px] bg-yellow-300/30" />
        <div className="absolute top-[3px] left-0 w-[3px] h-[3px] bg-yellow-300/30" />
        <div className="absolute top-0 -left-[3px] w-[3px] h-[3px] bg-yellow-300/30" />
        <div className="absolute top-0 left-[3px] w-[3px] h-[3px] bg-yellow-300/30" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   CategoryShelf — 메인 레이아웃
   ═══════════════════════════════════════════════════════ */
interface CategoryShelfProps {
  category: string;
  posts: Post[];
}

export default function CategoryShelf({ category, posts }: CategoryShelfProps) {
  const colors = getColors(category);

  const byYear = new Map<number, Post[]>();
  for (const p of posts) {
    const y = new Date(p.publishedAt ?? p.createdAt).getFullYear();
    if (!byYear.has(y)) byYear.set(y, []);
    byYear.get(y)!.push(p);
  }
  const years = Array.from(byYear.keys()).sort((a, b) => b - a);

  return (
    <section className="relative py-12 sm:py-20 overflow-hidden min-h-[60vh]">
      {/* 픽셀 별 장식 */}
      <PixelStar x="10%" y="15%" delay="0s" />
      <PixelStar x="85%" y="8%" delay="0.7s" />
      <PixelStar x="70%" y="25%" delay="1.4s" />
      <PixelStar x="20%" y="40%" delay="0.3s" />

      {/* Header */}
      <div className="relative mb-12 sm:mb-16 mx-auto max-w-5xl px-4 sm:px-6">
        <Link
          href="/explore"
          className="group inline-flex items-center gap-1.5 text-sm font-bold transition-colors duration-200 mb-6"
          style={{ color: colors.bg }}
        >
          <span className="transition-transform duration-200 group-hover:-translate-x-1">&larr;</span>
          서재로 돌아가기
        </Link>

        <div className="flex items-center gap-3">
          <h1
            className="text-3xl sm:text-4xl font-extrabold tracking-tight"
            style={{ color: colors.bg }}
          >
            {category}
          </h1>
          {/* 픽셀 뱃지 */}
          <span
            className="px-2 py-1 text-[11px] font-bold text-white"
            style={{ background: colors.accent, boxShadow: `2px 2px 0 rgba(0,0,0,0.2)` }}
          >
            {posts.length} books
          </span>
        </div>
        <p className="mt-2 text-sm text-content-muted">책장에서 읽고 싶은 책을 골라보세요!</p>
      </div>

      {/* Shelves by year */}
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
        {years.map((year) => (
          <div key={year} className="mb-20 last:mb-0">
            {/* Year label (픽셀 태그) */}
            <div className="flex items-center gap-3 mb-5">
              <span
                className="px-2 py-0.5 text-[11px] font-bold font-mono text-white"
                style={{ background: colors.spine, boxShadow: `2px 2px 0 ${colors.accent}` }}
              >
                {year}
              </span>
              <div
                className="flex-1 h-[2px]"
                style={{
                  backgroundImage: `repeating-linear-gradient(90deg, ${colors.bg}33 0px, ${colors.bg}33 4px, transparent 4px, transparent 8px)`,
                }}
              />
            </div>

            {/* Books + Shelf */}
            <div className="relative">
              <div
                className="flex items-end gap-[8px] sm:gap-[12px] pb-0 pl-3 pr-6 overflow-x-auto"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {byYear.get(year)!.map((post) =>
                  post.coverUrl ? (
                    <CoverBook key={post.id} post={post} colors={colors} />
                  ) : (
                    <SpineBook key={post.id} post={post} colors={colors} />
                  )
                )}
              </div>
              <ShelfPlank />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
