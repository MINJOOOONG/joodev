"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDateRange } from "@/lib/utils";
import { TIMELINE_CATEGORIES, getTimelineCategory } from "@/lib/timeline";

// ═══════════════════════════════════════════
// Types
// ═══════════════════════════════════════════

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverUrl: string | null;
  category: string;
  startDate: string | Date | null;
  endDate: string | Date | null;
  publishedAt: string | Date | null;
  tags: { name: string }[];
}

interface ExploreClientProps {
  posts: Post[];
}

interface DateGroup {
  dateKey: string;
  dateLabel: string;
  timestamp: number;
  posts: Post[];
}

// ═══════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════

function groupPostsByDate(posts: Post[]): DateGroup[] {
  const map = new Map<string, DateGroup>();
  const sorted = [...posts].reverse(); // oldest first

  for (const post of sorted) {
    const d = post.publishedAt ? new Date(post.publishedAt) : new Date();
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const label = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;

    if (!map.has(key)) {
      map.set(key, { dateKey: key, dateLabel: label, timestamp: d.getTime(), posts: [post] });
    } else {
      map.get(key)!.posts.push(post);
    }
  }

  return Array.from(map.values());
}

function formatPublishedDate(date: string | Date | null): string {
  if (!date) return "";
  const d = new Date(date);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

/** Organic thread curve — cat-rolled yarn, irregular and natural */
function threadCurveY(t: number): number {
  return (
    Math.sin(t * Math.PI * 2.3 + 0.7) * 16 +
    Math.sin(t * Math.PI * 4.7 + 1.2) * 8 +
    Math.sin(t * Math.PI * 7.1 + 0.3) * 4 +
    Math.sin(t * Math.PI * 11.3 + 2.1) * 2.5 +
    Math.cos(t * Math.PI * 3.1 + 0.5) * 6 +
    Math.sin(t * Math.PI * 17.7) * 1.5
  );
}

/** Generate smooth thread path using Catmull-Rom interpolation */
function generateThreadPath(xStart: number, xEnd: number, centerY: number): string {
  const steps = 100;
  const span = xEnd - xStart;
  const pts: { x: number; y: number }[] = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = xStart + t * span;
    pts.push({ x, y: centerY + threadCurveY(t) });
  }

  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

/** Generate a twist strand path that spirals around the main thread.
 *  phase: offset angle (use 0 and PI for two opposing strands)
 *  amplitude: how far the strand deviates from center */
function generateTwistPath(
  xStart: number,
  xEnd: number,
  centerY: number,
  phase: number,
  amplitude: number
): string {
  const steps = 250;
  const span = xEnd - xStart;
  const pts: { x: number; y: number }[] = [];
  const twistFreq = 40;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = xStart + t * span;
    const baseY = centerY + threadCurveY(t);

    // Approximate curve tangent for perpendicular offset
    const dt = 0.002;
    const t2 = Math.min(t + dt, 1);
    const dx = dt * span;
    const dy = threadCurveY(t2) - threadCurveY(t);
    const len = Math.sqrt(dx * dx + dy * dy) || 1;

    // Perpendicular direction
    const perpX = -dy / len;
    const perpY = dx / len;

    const offset = Math.sin(t * Math.PI * twistFreq + phase) * amplitude;

    pts.push({
      x: x + perpX * offset,
      y: baseY + perpY * offset,
    });
  }

  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

// ═══════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════

export default function ExploreClient({ posts }: ExploreClientProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    posts.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (!activeCategory) return posts;
    return posts.filter((p) => p.category === activeCategory);
  }, [posts, activeCategory]);

  const isAllView = activeCategory === null;
  const isDaily = activeCategory === "Daily";

  const handleCategoryClick = (category: string | null) => {
    setActiveCategory(category);
    if (category !== null) {
      setTimeout(() => {
        listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
      {/* Header */}
      <div className="mb-14 text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-heading mb-4">
          Explore
        </h1>
        <p className="text-content-3 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
          기록의 흐름을 따라 구경해보세요
        </p>
      </div>

      {/* Category Filter */}
      <CategoryFilter
        categoryCounts={categoryCounts}
        activeCategory={activeCategory}
        onSelect={handleCategoryClick}
        totalCount={posts.length}
      />

      {/* All View: Yarn Timeline */}
      {isAllView && posts.length > 0 && <YarnTimeline posts={posts} />}

      {/* Category Views */}
      <div ref={listRef}>
        {!isAllView &&
          (filteredPosts.length === 0 ? (
            <EmptyState />
          ) : isDaily ? (
            <DailyAlbumGrid posts={filteredPosts} />
          ) : (
            <TextPostList posts={filteredPosts} />
          ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// Category Filter
// ═══════════════════════════════════════════

function CategoryFilter({
  categoryCounts,
  activeCategory,
  onSelect,
  totalCount,
}: {
  categoryCounts: Record<string, number>;
  activeCategory: string | null;
  onSelect: (category: string | null) => void;
  totalCount: number;
}) {
  return (
    <div className="flex flex-wrap gap-2 mb-10 justify-center">
      {TIMELINE_CATEGORIES.filter((cat) => categoryCounts[cat.key]).map((cat) => (
        <button
          key={cat.key}
          onClick={() => onSelect(activeCategory === cat.key ? null : cat.key)}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition-colors duration-200 border ${
            activeCategory === cat.key
              ? "bg-accent-purple/15 text-accent-purple border-accent-purple/30 shadow-glow-sm"
              : "bg-surface-raised text-content-3 border-surface-border hover:border-surface-border-light hover:text-content-2"
          }`}
        >
          <span className="mr-1">{cat.icon}</span>
          {cat.label}
          <span className="ml-1.5 text-[10px] opacity-60">{categoryCounts[cat.key]}</span>
        </button>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════
// Yarn Timeline
// ═══════════════════════════════════════════

function YarnTimeline({ posts }: { posts: Post[] }) {
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [hoveredCxPercent, setHoveredCxPercent] = useState(0);
  const [hoveredAbove, setHoveredAbove] = useState(true);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dateGroups = useMemo(() => groupPostsByDate(posts), [posts]);

  // ── SVG layout ──
  const vbW = 1400;
  const vbH = 200;
  const centerY = vbH / 2;

  // Yarn ball
  const ballCx = 48;
  const ballCy = centerY;
  const ballR = 28;

  // Thread
  const threadX0 = ballCx + ballR + 12; // thread emerges from ball
  const threadX1 = vbW - 30;

  // Date circle positions (evenly spaced along thread)
  const circles = useMemo(() => {
    if (dateGroups.length === 0) return [];
    const span = threadX1 - threadX0;

    return dateGroups.map((g, i) => {
      const t =
        dateGroups.length === 1
          ? 0.5
          : i / (dateGroups.length - 1);
      const cx = threadX0 + t * span;
      const cy = centerY + threadCurveY(t);
      return { ...g, cx, cy, t };
    });
  }, [dateGroups, centerY]);

  // Thread path + twist strands
  const threadPath = useMemo(
    () => generateThreadPath(threadX0, threadX1, centerY),
    [centerY]
  );

  const twistA = useMemo(
    () => generateTwistPath(threadX0, threadX1, centerY, 0, 3.5),
    [centerY]
  );

  const twistB = useMemo(
    () => generateTwistPath(threadX0, threadX1, centerY, Math.PI, 3.5),
    [centerY]
  );

  // Yarn ball wound thread paths — chaotic overlapping arcs that look like wound yarn
  const yarnBallPaths = useMemo(() => {
    const paths: { d: string; stroke: string; width: number }[] = [];
    const cx = ballCx;
    const cy = ballCy;
    const r = ballR;

    // Generate wound yarn lines: arcs that cross the ball at various angles
    const windingData = [
      // { startAngle, endAngle, radiusScale, curveIntensity }
      { sa: -140, ea: 40, rs: 0.95, ci: 0.6, color: "rgba(180,150,240,0.30)", w: 2.2 },
      { sa: -60, ea: 120, rs: 0.9, ci: 0.5, color: "rgba(220,180,255,0.25)", w: 2.0 },
      { sa: 160, ea: -20, rs: 0.85, ci: 0.7, color: "rgba(160,130,220,0.28)", w: 2.4 },
      { sa: -110, ea: 70, rs: 0.92, ci: 0.4, color: "rgba(200,165,250,0.22)", w: 1.8 },
      { sa: 30, ea: 210, rs: 0.88, ci: 0.55, color: "rgba(240,190,255,0.20)", w: 2.0 },
      { sa: -170, ea: 10, rs: 0.78, ci: 0.65, color: "rgba(170,140,230,0.26)", w: 2.2 },
      { sa: -30, ea: 150, rs: 0.82, ci: 0.5, color: "rgba(190,155,240,0.24)", w: 1.9 },
      { sa: 80, ea: 260, rs: 0.94, ci: 0.45, color: "rgba(210,175,250,0.22)", w: 2.1 },
      { sa: -80, ea: 100, rs: 0.7, ci: 0.6, color: "rgba(230,195,255,0.18)", w: 1.7 },
      { sa: 110, ea: -70, rs: 0.86, ci: 0.55, color: "rgba(175,145,235,0.25)", w: 2.3 },
      { sa: -150, ea: 30, rs: 0.75, ci: 0.5, color: "rgba(195,160,245,0.20)", w: 1.8 },
      { sa: 50, ea: 230, rs: 0.8, ci: 0.65, color: "rgba(165,135,225,0.24)", w: 2.0 },
      { sa: -20, ea: 160, rs: 0.6, ci: 0.4, color: "rgba(215,180,250,0.18)", w: 1.6 },
      { sa: 140, ea: -40, rs: 0.72, ci: 0.5, color: "rgba(185,150,240,0.22)", w: 1.9 },
    ];

    for (const w of windingData) {
      const rad1 = (w.sa * Math.PI) / 180;
      const rad2 = (w.ea * Math.PI) / 180;
      const x1 = cx + Math.cos(rad1) * r * w.rs;
      const y1 = cy + Math.sin(rad1) * r * w.rs;
      const x2 = cx + Math.cos(rad2) * r * w.rs;
      const y2 = cy + Math.sin(rad2) * r * w.rs;

      // Control points create a bulging arc across the ball
      const midAngle = (rad1 + rad2) / 2;
      const bulge = r * w.ci;
      const cpx = cx + Math.cos(midAngle + 0.4) * bulge;
      const cpy = cy + Math.sin(midAngle + 0.4) * bulge;

      paths.push({
        d: `M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${cpx.toFixed(1)} ${cpy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`,
        stroke: w.color,
        width: w.w,
      });
    }

    return paths;
  }, [ballCy]);

  // Unraveling tail — yarn emerging from ball into the thread
  const unravelPath = useMemo(() => {
    const startAngle = -25;
    const rad = (startAngle * Math.PI) / 180;
    const sx = ballCx + Math.cos(rad) * ballR * 0.9;
    const sy = ballCy + Math.sin(rad) * ballR * 0.9;
    const endY = centerY + threadCurveY(0);
    // A loose, slightly wavy curve from ball surface to thread start
    const cp1x = sx + 18;
    const cp1y = sy - 6;
    const cp2x = threadX0 - 16;
    const cp2y = endY + 4;
    return `M ${sx.toFixed(1)} ${sy.toFixed(1)} C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${threadX0} ${endY.toFixed(1)}`;
  }, [ballCy, centerY]);

  // ── Hover handlers with delay for dropdown interaction ──
  const showHover = useCallback(
    (dateKey: string, cxPercent: number, above: boolean) => {
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
      setHoveredDate(dateKey);
      setHoveredCxPercent(cxPercent);
      setHoveredAbove(above);
    },
    []
  );

  const scheduleHide = useCallback(() => {
    hideTimeout.current = setTimeout(() => setHoveredDate(null), 250);
  }, []);

  const cancelHide = useCallback(() => {
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
  }, []);

  // Hovered group data
  const hoveredGroup = hoveredDate
    ? circles.find((c) => c.dateKey === hoveredDate) || null
    : null;

  return (
    <div className="relative my-6">
      {/* SVG Timeline */}
      <svg
        viewBox={`0 0 ${vbW} ${vbH}`}
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* ── Yarn Ball — wound thread paths ── */}
        <g>
          {/* Soft shadow under ball */}
          <ellipse
            cx={ballCx + 2}
            cy={ballCy + 4}
            rx={ballR + 3}
            ry={ballR + 1}
            fill="rgba(40,20,80,0.12)"
          />
          {/* Faint fill for volume */}
          <circle
            cx={ballCx}
            cy={ballCy}
            r={ballR}
            fill="rgba(120,90,200,0.06)"
          />
          {/* Wound yarn threads — crossing arcs */}
          {yarnBallPaths.map((p, i) => (
            <path
              key={i}
              d={p.d}
              fill="none"
              stroke={p.stroke}
              strokeWidth={p.width}
              strokeLinecap="round"
            />
          ))}
          {/* Subtle highlight on top-left */}
          <circle
            cx={ballCx - 7}
            cy={ballCy - 9}
            r={8}
            fill="rgba(255,255,255,0.03)"
          />
        </g>

        {/* ── Unravel: yarn emerging from ball → thread ── */}
        <path
          d={unravelPath}
          fill="none"
          stroke="rgba(130,100,200,0.20)"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d={unravelPath}
          fill="none"
          stroke="rgba(167,139,250,0.32)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d={unravelPath}
          fill="none"
          stroke="rgba(200,175,255,0.22)"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* ── Thread: layered yarn body ── */}

        {/* Shadow — depth under the yarn */}
        <path
          d={threadPath}
          fill="none"
          stroke="rgba(80,50,140,0.12)"
          strokeWidth="14"
          strokeLinecap="round"
        />

        {/* Outer body — dark edge, gives thickness */}
        <path
          d={threadPath}
          fill="none"
          stroke="rgba(130,100,200,0.22)"
          strokeWidth="9"
          strokeLinecap="round"
        />

        {/* Inner body — lighter center, volume */}
        <path
          d={threadPath}
          fill="none"
          stroke="rgba(167,139,250,0.35)"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Core — brightest center strip */}
        <path
          d={threadPath}
          fill="none"
          stroke="rgba(200,175,255,0.28)"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Top highlight — round tube illusion */}
        <path
          d={threadPath}
          fill="none"
          stroke="rgba(230,215,255,0.12)"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeDasharray="8,12"
        />

        {/* ── Twist strands — braided texture ── */}

        {/* Strand A — pinkish twist */}
        <path
          d={twistA}
          fill="none"
          stroke="rgba(240,171,252,0.22)"
          strokeWidth="1.3"
          strokeLinecap="round"
        />

        {/* Strand B — purple twist */}
        <path
          d={twistB}
          fill="none"
          stroke="rgba(167,139,250,0.20)"
          strokeWidth="1.3"
          strokeLinecap="round"
        />

        {/* ── Date circles ── */}
        {circles.map((c) => {
          const isHovered = hoveredDate === c.dateKey;
          const r = isHovered ? 9 : 6;
          const postCount = c.posts.length;

          return (
            <g
              key={c.dateKey}
              className="cursor-pointer"
              onMouseEnter={() => {
                const above = c.cy > centerY;
                showHover(c.dateKey, (c.cx / vbW) * 100, above);
              }}
              onMouseLeave={scheduleHide}
            >
              {/* Hover aura */}
              {isHovered && (
                <circle
                  cx={c.cx}
                  cy={c.cy}
                  r={18}
                  fill="rgba(167,139,250,0.10)"
                  className="transition-all duration-200"
                />
              )}
              {/* Circle */}
              <circle
                cx={c.cx}
                cy={c.cy}
                r={r}
                fill={
                  isHovered
                    ? "rgba(167,139,250,0.7)"
                    : "rgba(167,139,250,0.35)"
                }
                stroke={
                  isHovered
                    ? "rgba(167,139,250,0.9)"
                    : "rgba(167,139,250,0.15)"
                }
                strokeWidth={isHovered ? 2 : 1}
                className="transition-all duration-200"
              />
              {/* Center dot */}
              <circle
                cx={c.cx}
                cy={c.cy}
                r={isHovered ? 3 : 2}
                fill="white"
                opacity={isHovered ? 0.7 : 0.3}
                className="pointer-events-none"
              />
              {/* Post count (shown only if > 1) */}
              {postCount > 1 && !isHovered && (
                <text
                  x={c.cx}
                  y={c.cy - 14}
                  textAnchor="middle"
                  fontSize="9"
                  fill="rgba(167,139,250,0.5)"
                  className="pointer-events-none select-none"
                >
                  {postCount}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* ── Hover dropdown (HTML overlay) ── */}
      {hoveredGroup && (
        <div
          className="absolute z-50 pointer-events-auto"
          style={{
            left: `${hoveredCxPercent}%`,
            transform: "translateX(-50%)",
            ...(hoveredAbove
              ? { bottom: "calc(50% + 24px)" }
              : { top: "calc(50% + 24px)" }),
          }}
          onMouseEnter={cancelHide}
          onMouseLeave={scheduleHide}
        >
          <div className="bg-surface-raised border border-surface-border rounded-xl shadow-lg px-4 py-3 min-w-[220px] max-w-[320px]">
            {/* Date header */}
            <p className="text-[11px] text-accent-purple font-semibold mb-2 font-mono">
              {hoveredGroup.dateLabel}
              <span className="text-content-muted font-normal ml-1.5">
                · {hoveredGroup.posts.length}개
              </span>
            </p>

            {/* Post list */}
            <ul className="space-y-1.5">
              {hoveredGroup.posts.map((post) => {
                const cat = getTimelineCategory(post.category);
                return (
                  <li key={post.id}>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="group flex items-start gap-2 py-1 px-1.5 -mx-1.5 rounded-lg hover:bg-surface-overlay/50 transition-colors"
                    >
                      {cat && (
                        <span className="text-[10px] mt-0.5 flex-shrink-0">
                          {cat.icon}
                        </span>
                      )}
                      <span className="text-[13px] text-content-2 group-hover:text-accent-purple transition-colors leading-snug line-clamp-1">
                        {post.title}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// Daily Album Grid
// ═══════════════════════════════════════════

function DailyAlbumGrid({ posts }: { posts: Post[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/blog/${post.slug}`}
          className="group relative aspect-square rounded-2xl overflow-hidden border border-surface-border hover:border-accent-pink/30 transition-[border-color] duration-300"
        >
          {post.coverUrl ? (
            <Image
              src={post.coverUrl}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/10 via-surface to-accent-pink/10 flex items-center justify-center">
              <span className="text-3xl opacity-30">📸</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
            <h3 className="text-white text-sm font-bold leading-snug line-clamp-2">
              {post.title}
            </h3>
            {post.startDate && (
              <span className="text-white/60 text-[11px] mt-1 font-mono">
                {formatDateRange(post.startDate, post.endDate)}
              </span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════
// Text Post List (non-Daily)
// ═══════════════════════════════════════════

function TextPostList({ posts }: { posts: Post[] }) {
  return (
    <div className="space-y-2.5">
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/blog/${post.slug}`}
          className="group block p-4 rounded-xl border border-surface-border bg-surface hover:border-accent-purple/25 hover:shadow-card-hover transition-[border-color,box-shadow] duration-300"
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              {post.tags.slice(0, 3).map((tag) => (
                <span key={tag.name} className="tag text-[10px]">
                  {tag.name}
                </span>
              ))}
            </div>
            <span className="text-[11px] text-content-muted font-mono flex-shrink-0">
              {formatPublishedDate(post.publishedAt)}
            </span>
          </div>
          <h3 className="text-[15px] font-bold text-heading group-hover:text-accent-purple transition-colors line-clamp-1">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-sm text-content-muted line-clamp-2 mt-1 leading-relaxed">
              {post.excerpt}
            </p>
          )}
          {post.startDate && (
            <div className="mt-2">
              <span className="text-[11px] text-content-muted font-mono">
                {formatDateRange(post.startDate, post.endDate)}
              </span>
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════
// Empty State
// ═══════════════════════════════════════════

function EmptyState() {
  return (
    <div className="text-center py-20 text-content-muted">
      <p className="text-4xl mb-3">🐱</p>
      <p className="text-sm">아직 글이 없어요</p>
    </div>
  );
}
