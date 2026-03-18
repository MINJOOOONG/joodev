"use client";

import { useRef, useState } from "react";
import Link from "next/link";

interface Post {
  id: string;
  slug: string;
  title: string;
  category: string;
  publishedAt: string | null;
  createdAt: string;
  tags: { name: string }[];
}

interface ExploreClientProps {
  posts: Post[];
}

const CATEGORY_COLORS: Record<string, string> = {
  Frontend: "34,211,238",
  Review: "167,139,250",
  Experiences: "251,191,36",
  Daily: "52,211,153",
};

const DEFAULT_RGB = "167,139,250";

function getYear(post: Post) {
  return new Date(post.publishedAt ?? post.createdAt).getFullYear();
}

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default function ExploreClient({ posts }: ExploreClientProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const years = Array.from(new Set(posts.map(getYear))).sort((a, b) => a - b);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -320 : 320,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative min-h-[70vh] flex flex-col justify-center py-16 sm:py-24 overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-10 left-1/4 w-[300px] h-[300px] bg-purple-500/[0.04] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-[250px] h-[250px] bg-cyan-500/[0.03] rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="relative mb-12 sm:mb-14 text-center px-4">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent-purple/20 bg-accent-purple/[0.06] px-4 py-1.5 text-xs font-semibold text-accent-purple backdrop-blur-sm shadow-[0_0_15px_rgba(167,139,250,0.1)]">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-purple shadow-[0_0_6px_rgba(167,139,250,0.8)] animate-pulse" />
          Timeline
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-heading">
          Explore
        </h1>
        <p className="mt-3 text-sm text-content-muted max-w-sm mx-auto leading-relaxed">
          시간의 흐름을 따라 둘러보세요.
        </p>
      </div>

      {/* Scroll buttons */}
      <div className="relative px-2 sm:px-6">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-surface-raised/80 border border-surface-border/50 backdrop-blur-sm flex items-center justify-center text-content-faint hover:text-content-2 hover:border-surface-border-light transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-surface-raised/80 border border-surface-border/50 backdrop-blur-sm flex items-center justify-center text-content-faint hover:text-content-2 hover:border-surface-border-light transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Horizontal scrollable timeline */}
        <div
          ref={scrollRef}
          className="overflow-x-auto scrollbar-hide px-8 sm:px-12"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="relative min-w-max py-8">
            {/* Main horizontal line — thicker + more visible */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-purple-500/30 via-cyan-500/25 via-amber-500/20 to-emerald-500/25 rounded-full" />
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[3px] bg-gradient-to-r from-purple-500/15 via-cyan-500/10 to-pink-500/15 blur-sm rounded-full" />

            <div className="flex items-center">
              {years.map((year, yi) => {
                const yearPosts = posts.filter((p) => getYear(p) === year);
                return (
                  <div key={year} className="flex items-center">
                    {/* Year marker */}
                    <div className="relative flex flex-col items-center mx-3 sm:mx-5">
                      {/* Year dot on line */}
                      <div className="w-2.5 h-2.5 rounded-full bg-accent-purple/50 border border-accent-purple/30 mb-5" />
                      <span className="absolute top-7 text-[11px] font-bold font-mono text-accent-purple/60 whitespace-nowrap">
                        {year}
                      </span>
                    </div>

                    {/* Post dots */}
                    {yearPosts.map((post) => {
                      const rgb = CATEGORY_COLORS[post.category] ?? DEFAULT_RGB;
                      const isHovered = hoveredId === post.id;

                      return (
                        <div
                          key={post.id}
                          className="relative flex flex-col items-center mx-[6px] sm:mx-2.5"
                          onMouseEnter={() => setHoveredId(post.id)}
                          onMouseLeave={() => setHoveredId(null)}
                        >
                          {/* The dot */}
                          <Link href={`/blog/${post.slug}`}>
                            <div
                              className="relative z-10 rounded-full transition-all duration-300 cursor-pointer"
                              style={{
                                width: isHovered ? "14px" : "10px",
                                height: isHovered ? "14px" : "10px",
                                borderWidth: "2px",
                                borderStyle: "solid",
                                borderColor: isHovered ? `rgba(${rgb},1)` : `rgba(${rgb},0.4)`,
                                backgroundColor: isHovered ? `rgba(${rgb},1)` : `rgba(${rgb},0.2)`,
                                boxShadow: isHovered
                                  ? `0 0 14px rgba(${rgb},0.6), 0 0 28px rgba(${rgb},0.25)`
                                  : `0 0 4px rgba(${rgb},0.15)`,
                              }}
                            />
                          </Link>

                          {/* Hover tooltip */}
                          <div
                            className="absolute bottom-full mb-5 left-1/2 pointer-events-none transition-all duration-200 z-30"
                            style={{
                              opacity: isHovered ? 1 : 0,
                              transform: isHovered
                                ? "translateX(-50%) translateY(0)"
                                : "translateX(-50%) translateY(4px)",
                            }}
                          >
                            <div
                              className="w-52 rounded-xl border bg-[rgb(var(--color-bg))]/95 px-4 py-3 backdrop-blur-md pointer-events-auto"
                              style={{
                                borderColor: `rgba(${rgb},0.25)`,
                                boxShadow: `0 8px 32px rgba(0,0,0,0.35), 0 0 16px rgba(${rgb},0.1)`,
                              }}
                            >
                              {/* Date */}
                              <span className="text-[10px] text-content-faint font-mono">
                                {formatShortDate(post.publishedAt ?? post.createdAt)}
                              </span>
                              {/* Title */}
                              <Link
                                href={`/blog/${post.slug}`}
                                className="block mt-1 text-[13px] font-bold text-heading leading-snug line-clamp-2"
                              >
                                {post.title}
                              </Link>
                              {/* Tags */}
                              {post.tags.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {post.tags.map((tag) => (
                                    <span
                                      key={tag.name}
                                      className="rounded-md px-1.5 py-0.5 text-[9px] font-semibold"
                                      style={{
                                        background: `rgba(${rgb},0.1)`,
                                        color: `rgba(${rgb},0.8)`,
                                        border: `1px solid rgba(${rgb},0.15)`,
                                      }}
                                    >
                                      {tag.name}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {/* Triangle */}
                              <div
                                className="absolute -bottom-[6px] left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 border-r border-b bg-[rgb(var(--color-bg))]/95"
                                style={{ borderColor: `rgba(${rgb},0.25)` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Year separator — visible dashed segment */}
                    {yi < years.length - 1 && (
                      <div className="w-10 sm:w-14 mx-1" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="relative mt-10 sm:mt-12 text-center text-xs text-content-faint font-mono tracking-wide">
        &mdash; or browse{" "}
        <Link href="/blog" className="text-purple-400/60 hover:text-purple-400 transition-colors underline underline-offset-2 decoration-purple-400/20 hover:decoration-purple-400/50">
          all posts
        </Link>
      </p>
    </section>
  );
}
