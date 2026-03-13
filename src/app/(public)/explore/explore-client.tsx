"use client";

import { useState, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDateRange } from "@/lib/utils";
import { TIMELINE_CATEGORIES, getTimelineCategory } from "@/lib/timeline";

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

interface TimelineNode {
  category: string;
  label: string;
  icon: string;
  color: string;
  glowColor: string;
  description: string;
  count: number;
}

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

  const timelineNodes: TimelineNode[] = useMemo(() => {
    return TIMELINE_CATEGORIES.filter((cat) => categoryCounts[cat.key]).map((cat) => ({
      category: cat.key,
      label: cat.label,
      icon: cat.icon,
      color: cat.color,
      glowColor: cat.glowColor,
      description: cat.description,
      count: categoryCounts[cat.key] || 0,
    }));
  }, [categoryCounts]);

  const filteredPosts = useMemo(() => {
    if (!activeCategory) return posts;
    return posts.filter((p) => p.category === activeCategory);
  }, [posts, activeCategory]);

  const isDaily = activeCategory === "Daily";
  const showList = activeCategory !== null;

  const handleNodeClick = (category: string) => {
    setActiveCategory((prev) => (prev === category ? null : category));
    setTimeout(() => {
      listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-20">
      {/* Header */}
      <div className="mb-16 text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-heading mb-4">
          Explore
        </h1>
        <p className="text-content-3 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
          기록의 흐름을 따라 구경해보세요
        </p>
      </div>

      {/* Category Tabs — moved above timeline */}
      <div className="flex flex-wrap gap-2 mb-12 justify-center">
        <button
          onClick={() => setActiveCategory(null)}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-200 border ${
            activeCategory === null
              ? "bg-accent-purple/15 text-accent-purple border-accent-purple/30 shadow-glow-sm"
              : "bg-surface-raised text-content-3 border-surface-border hover:border-surface-border-light hover:text-content-2"
          }`}
        >
          All
          <span className="ml-1.5 text-[10px] opacity-60">{posts.length}</span>
        </button>
        {TIMELINE_CATEGORIES.filter((cat) => categoryCounts[cat.key]).map((cat) => (
          <button
            key={cat.key}
            onClick={() => handleNodeClick(cat.key)}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-200 border ${
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

      {/* Timeline SVG */}
      {timelineNodes.length > 0 && (
        <TimelineSection
          nodes={timelineNodes}
          activeCategory={activeCategory}
          onNodeClick={handleNodeClick}
        />
      )}

      {/* Post List — only shown when a category is selected */}
      <div ref={listRef}>
        {showList && (
          <div className="pt-4">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-20 text-content-muted">
                <p className="text-4xl mb-3">🐱</p>
                <p className="text-sm">아직 글이 없어요</p>
              </div>
            ) : isDaily ? (
              <DailyAlbumGrid posts={filteredPosts} />
            ) : (
              <PostListView posts={filteredPosts} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// Timeline Section — Thick Neon Worm Bezier
// ═══════════════════════════════════════════

function TimelineSection({
  nodes,
  activeCategory,
  onNodeClick,
}: {
  nodes: TimelineNode[];
  activeCategory: string | null;
  onNodeClick: (category: string) => void;
}) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const nodeCount = nodes.length;
  const svgWidth = 900;
  const svgHeight = 220;
  const paddingX = 70;
  const usableWidth = svgWidth - paddingX * 2;

  const nodePositions = useMemo(() => {
    return nodes.map((node, i) => {
      const x = paddingX + (i / Math.max(nodeCount - 1, 1)) * usableWidth;
      const baseY = svgHeight / 2;
      const amplitude = 40;
      const y = baseY + Math.sin((i * Math.PI) / 1.5 + 0.5) * amplitude;
      return { ...node, x, y };
    });
  }, [nodes, nodeCount, usableWidth]);

  const pathD = useMemo(() => {
    if (nodePositions.length === 0) return "";
    if (nodePositions.length === 1) {
      const p = nodePositions[0];
      return `M ${p.x} ${p.y}`;
    }

    let d = `M ${nodePositions[0].x} ${nodePositions[0].y}`;
    for (let i = 0; i < nodePositions.length - 1; i++) {
      const curr = nodePositions[i];
      const next = nodePositions[i + 1];
      const cpx1 = curr.x + (next.x - curr.x) * 0.4;
      const cpy1 = curr.y;
      const cpx2 = next.x - (next.x - curr.x) * 0.4;
      const cpy2 = next.y;
      d += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${next.x} ${next.y}`;
    }
    return d;
  }, [nodePositions]);

  return (
    <div className="mb-16 overflow-x-auto">
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full min-w-[600px] h-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Heavier neon glow for the worm line */}
          <filter id="wormGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur2" />
            <feMerge>
              <feMergeNode in="blur1" />
              <feMergeNode in="blur2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="nodeGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          {/* Line gradient */}
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgb(var(--color-accent))" stopOpacity="0.08" />
            <stop offset="20%" stopColor="rgb(var(--color-accent))" stopOpacity="0.6" />
            <stop offset="50%" stopColor="rgb(var(--color-accent))" stopOpacity="0.8" />
            <stop offset="80%" stopColor="rgb(var(--color-accent))" stopOpacity="0.6" />
            <stop offset="100%" stopColor="rgb(var(--color-accent))" stopOpacity="0.08" />
          </linearGradient>
          <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgb(var(--color-accent))" stopOpacity="0" />
            <stop offset="20%" stopColor="rgb(var(--color-accent))" stopOpacity="0.35" />
            <stop offset="50%" stopColor="rgb(var(--color-accent))" stopOpacity="0.5" />
            <stop offset="80%" stopColor="rgb(var(--color-accent))" stopOpacity="0.35" />
            <stop offset="100%" stopColor="rgb(var(--color-accent))" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Outermost soft glow layer */}
        <path
          d={pathD}
          fill="none"
          stroke="url(#glowGradient)"
          strokeWidth="24"
          strokeLinecap="round"
          filter="url(#wormGlow)"
          opacity="0.3"
        />

        {/* Mid glow layer */}
        <path
          d={pathD}
          fill="none"
          stroke="url(#glowGradient)"
          strokeWidth="12"
          strokeLinecap="round"
          opacity="0.4"
        />

        {/* Main thick neon line */}
        <path
          d={pathD}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Bright core line */}
        <path
          d={pathD}
          fill="none"
          stroke="rgb(var(--color-accent))"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.7"
        />

        {/* Nodes */}
        {nodePositions.map((node) => {
          const isActive = activeCategory === node.category;
          const isHovered = hoveredNode === node.category;
          const highlighted = isActive || isHovered;

          return (
            <g
              key={node.category}
              className="cursor-pointer"
              onClick={() => onNodeClick(node.category)}
              onMouseEnter={() => setHoveredNode(node.category)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              {/* Outer glow */}
              <circle
                cx={node.x}
                cy={node.y}
                r={highlighted ? 24 : 18}
                fill={node.glowColor.replace("0.6", highlighted ? "0.18" : "0.08")}
                className="transition-all duration-300"
                filter={highlighted ? "url(#nodeGlow)" : undefined}
              />
              {/* Node circle */}
              <circle
                cx={node.x}
                cy={node.y}
                r={highlighted ? 15 : 11}
                fill={highlighted ? node.glowColor.replace("0.6", "0.25") : "rgb(var(--color-surface))"}
                stroke={node.glowColor}
                strokeWidth={highlighted ? 3 : 2}
                className="transition-all duration-300"
              />
              {/* Icon text */}
              <text
                x={node.x}
                y={node.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={highlighted ? "15" : "12"}
                className="transition-all duration-300 pointer-events-none select-none"
              >
                {node.icon}
              </text>
              {/* Label below */}
              <text
                x={node.x}
                y={node.y + (highlighted ? 34 : 28)}
                textAnchor="middle"
                fontSize="11"
                fontWeight={highlighted ? "700" : "500"}
                fill={highlighted ? node.glowColor.replace("0.6", "1") : "rgb(var(--color-text-3))"}
                className="transition-all duration-300 pointer-events-none select-none"
              >
                {node.label}
              </text>
              {/* Count badge */}
              <text
                x={node.x}
                y={node.y + (highlighted ? 47 : 41)}
                textAnchor="middle"
                fontSize="9"
                fill="rgb(var(--color-text-muted))"
                className="pointer-events-none select-none"
              >
                {node.count}개
              </text>
            </g>
          );
        })}

        {/* Hover Tooltip */}
        {hoveredNode && (() => {
          const node = nodePositions.find((n) => n.category === hoveredNode);
          if (!node) return null;
          const tooltipW = 160;
          const tooltipH = 50;
          const tx = Math.min(Math.max(node.x - tooltipW / 2, 5), svgWidth - tooltipW - 5);
          const ty = node.y - 65;

          return (
            <g className="pointer-events-none">
              <rect
                x={tx}
                y={ty}
                width={tooltipW}
                height={tooltipH}
                rx="10"
                fill="rgb(var(--color-surface-raised))"
                stroke="rgb(var(--color-border))"
                strokeWidth="1"
                opacity="0.95"
              />
              <text
                x={tx + tooltipW / 2}
                y={ty + 20}
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fill="rgb(var(--color-heading))"
              >
                {node.icon} {node.label}
              </text>
              <text
                x={tx + tooltipW / 2}
                y={ty + 37}
                textAnchor="middle"
                fontSize="10"
                fill="rgb(var(--color-text-muted))"
              >
                {node.description}
              </text>
            </g>
          );
        })()}
      </svg>
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
          className="group relative aspect-square rounded-2xl overflow-hidden border border-surface-border hover:border-accent-purple/30 transition-all duration-300"
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
// Post List View
// ═══════════════════════════════════════════

function PostListView({ posts }: { posts: Post[] }) {
  return (
    <div className="space-y-4">
      {posts.map((post) => {
        const catMeta = getTimelineCategory(post.category);
        return (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group flex gap-4 sm:gap-5 p-4 rounded-2xl border border-surface-border bg-surface hover:border-accent-purple/25 hover:shadow-card-hover transition-all duration-300"
          >
            {post.coverUrl ? (
              <div className="relative w-24 h-24 sm:w-32 sm:h-24 flex-shrink-0 rounded-xl overflow-hidden">
                <Image
                  src={post.coverUrl}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            ) : (
              <div className="w-24 h-24 sm:w-32 sm:h-24 flex-shrink-0 rounded-xl bg-gradient-to-br from-accent-purple/[0.06] via-surface to-accent-pink/[0.04] flex items-center justify-center">
                <span className="text-accent-purple/20 font-mono text-sm">&lt;/&gt;</span>
              </div>
            )}

            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-1">
                {catMeta && (
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-accent-purple/70">
                    {catMeta.icon} {catMeta.label}
                  </span>
                )}
                {post.startDate && (
                  <span className="text-[11px] text-content-muted font-mono">
                    {formatDateRange(post.startDate, post.endDate)}
                  </span>
                )}
              </div>
              <h3 className="text-[15px] font-bold text-heading group-hover:text-accent-purple transition-colors duration-200 line-clamp-1">
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="text-sm text-content-muted line-clamp-1 mt-1">
                  {post.excerpt}
                </p>
              )}
              {post.tags.length > 0 && (
                <div className="flex gap-1.5 mt-2">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span key={tag.name} className="tag text-[10px]">
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
