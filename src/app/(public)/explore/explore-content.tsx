"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface PostItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverUrl: string | null;
  category: string;
  publishedAt: string | null;
  createdAt: string;
  tags: string[];
}

interface ExploreContentProps {
  posts: PostItem[];
}

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

function PixelDot({ className }: { className?: string }) {
  return <span className={cn("inline-block w-[4px] h-[4px] shrink-0", className)} />;
}

const CATEGORY_ACCENT: Record<string, string> = {
  Daily: "bg-accent-pink",
  Backend: "bg-accent-blue",
  Frontend: "bg-accent-mint",
  QA: "bg-green-400",
  DevOps: "bg-accent-orange",
  Review: "bg-accent-purple",
  Experiences: "bg-yellow-400",
};

export default function ExploreContent({ posts }: ExploreContentProps) {
  const categories = useMemo(() => {
    const grouped = new Map<string, PostItem[]>();
    for (const post of posts) {
      const cat = post.category;
      if (!grouped.has(cat)) grouped.set(cat, []);
      grouped.get(cat)!.push(post);
    }

    const entries = Array.from(grouped.entries());
    const daily = entries.find(([cat]) => cat === "Daily");
    const rest = entries
      .filter(([cat]) => cat !== "Daily")
      .sort((a, b) => b[1].length - a[1].length);

    return daily ? [daily, ...rest] : rest;
  }, [posts]);

  const [activeCategory, setActiveCategory] = useState<string>(
    categories[0]?.[0] ?? ""
  );

  /* Reset content key to re-trigger entrance animation on category change */
  const [contentKey, setContentKey] = useState(0);
  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setContentKey((k) => k + 1);
  };

  if (categories.length === 0) {
    return (
      <p className="text-center text-sm text-content-faint">
        아직 게시된 글이 없습니다.
      </p>
    );
  }

  const activePosts =
    categories.find(([cat]) => cat === activeCategory)?.[1] ?? [];
  const isDaily = activeCategory === "Daily";

  return (
    <div>
      {/* ── Category filter tabs ── */}
      <div className="flex justify-center mb-12">
        <div className="inline-flex flex-wrap justify-center gap-1 sm:gap-1.5 p-1 rounded-xl bg-surface/50">
          {categories.map(([category, catPosts]) => {
            const isActive = activeCategory === category;
            const dotColor = CATEGORY_ACCENT[category] ?? "bg-content-faint";

            return (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={cn(
                  "relative flex items-center gap-1.5 px-3.5 py-1.5 text-[12px] font-medium tracking-tight rounded-lg transition-all duration-250",
                  isActive
                    ? "bg-surface-raised text-heading shadow-sm border border-surface-border/80"
                    : "text-content-muted hover:text-content-2 hover:bg-surface-raised/40 border border-transparent"
                )}
              >
                <PixelDot
                  className={cn(
                    dotColor,
                    "transition-opacity duration-200",
                    isActive ? "opacity-100" : "opacity-30 group-hover:opacity-60"
                  )}
                />
                {category}
                <span
                  className={cn(
                    "text-[10px] font-mono tabular-nums transition-colors duration-200",
                    isActive ? "text-content-muted" : "text-content-ghost"
                  )}
                >
                  {catPosts.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content area with entrance animation ── */}
      <div key={contentKey} className="animate-fade-in-up">
        {isDaily ? (
          <DailyGrid posts={activePosts} />
        ) : (
          <PostList posts={activePosts} />
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Stagger entrance hook
   ───────────────────────────────────────────── */

function useStagger(count: number, baseDelay = 60) {
  const [visible, setVisible] = useState<boolean[]>([]);
  const ref = useRef(false);

  useEffect(() => {
    ref.current = true;
    const arr = new Array(count).fill(false);
    setVisible(arr);

    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < count; i++) {
      timers.push(
        setTimeout(() => {
          if (!ref.current) return;
          setVisible((prev) => {
            const next = [...prev];
            next[i] = true;
            return next;
          });
        }, i * baseDelay)
      );
    }

    return () => {
      ref.current = false;
      timers.forEach(clearTimeout);
    };
  }, [count, baseDelay]);

  return visible;
}

/* ─────────────────────────────────────────────
   Phone variant system
   ───────────────────────────────────────────── */

interface PhoneVariant {
  border: string;
  bezel: string;
  accent: string;       // stronger tint for dark mode edge
  batteryColor: string;
  time: string;
  wifi: boolean;        // visual variation: wifi or cellular
}

const PHONE_VARIANTS: PhoneVariant[] = [
  {
    border: "rgba(240,171,252,0.4)",
    bezel: "rgba(240,171,252,0.06)",
    accent: "rgba(240,171,252,0.15)",
    batteryColor: "bg-accent-pink/70",
    time: "9:41",
    wifi: false,
  },
  {
    border: "rgba(167,139,250,0.4)",
    bezel: "rgba(167,139,250,0.06)",
    accent: "rgba(167,139,250,0.15)",
    batteryColor: "bg-accent-purple/70",
    time: "11:28",
    wifi: true,
  },
  {
    border: "rgba(147,197,253,0.4)",
    bezel: "rgba(147,197,253,0.06)",
    accent: "rgba(147,197,253,0.15)",
    batteryColor: "bg-accent-blue/60",
    time: "3:14",
    wifi: false,
  },
  {
    border: "rgba(110,231,183,0.35)",
    bezel: "rgba(110,231,183,0.05)",
    accent: "rgba(110,231,183,0.12)",
    batteryColor: "bg-accent-mint/60",
    time: "7:07",
    wifi: true,
  },
  {
    border: "rgba(253,186,116,0.4)",
    bezel: "rgba(253,186,116,0.06)",
    accent: "rgba(253,186,116,0.15)",
    batteryColor: "bg-accent-orange/60",
    time: "5:55",
    wifi: false,
  },
];

/* ─────────────────────────────────────────────
   Daily: individual phone cards (fixed ratio)
   ───────────────────────────────────────────── */

function DailyGrid({ posts }: { posts: PostItem[] }) {
  const visible = useStagger(posts.length, 80);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-7 max-w-[640px] mx-auto">
      {posts.map((post, i) => (
        <div
          key={post.id}
          className="transition-all duration-[450ms] ease-out"
          style={{
            opacity: visible[i] ? 1 : 0,
            transform: visible[i] ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <PhoneCard post={post} variant={PHONE_VARIANTS[i % PHONE_VARIANTS.length]} />
        </div>
      ))}
    </div>
  );
}

/** Fixed phone height: status(28) + sep(1) + content-area + home(24) = fills h-[420px] screen */
const PHONE_SCREEN_H = "h-[420px]";

function PhoneCard({ post, variant }: { post: PostItem; variant: PhoneVariant }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      {/* ── Device body — fixed height ── */}
      <div
        className="relative rounded-[20px] transition-all duration-300 ease-out group-hover:-translate-y-1.5 group-hover:scale-[1.015]"
        style={{
          padding: "8px 5px",
          background: `linear-gradient(175deg, ${variant.accent}, ${variant.bezel} 40%, rgba(var(--color-surface-overlay), 0.6))`,
          boxShadow: `
            inset 0 0 0 1px ${variant.border},
            0 1px 2px rgba(0,0,0,0.08),
            0 4px 12px rgba(0,0,0,0.12),
            0 12px 36px rgba(0,0,0,0.16)
          `,
        }}
      >
        {/* ── Physical buttons ── */}
        <div className="absolute -right-[3px] top-[80px] w-[3px] h-[24px] rounded-r-[2px]" style={{ background: variant.border }} />
        <div className="absolute -left-[3px] top-[64px] w-[3px] h-[18px] rounded-l-[2px]" style={{ background: variant.border }} />
        <div className="absolute -left-[3px] top-[90px] w-[3px] h-[18px] rounded-l-[2px]" style={{ background: variant.border }} />
        <div className="absolute -left-[2px] top-[48px] w-[2px] h-[10px] rounded-l-[1px]" style={{ background: variant.border }} />

        {/* ── Screen — fixed height ── */}
        <div
          className={cn(PHONE_SCREEN_H, "rounded-[14px] overflow-hidden border border-surface-border/40 flex flex-col")}
          style={{ background: "rgb(var(--color-surface-raised))" }}
        >
          {/* Status bar — fixed 28px */}
          <div className="flex items-center justify-between px-4 h-7 shrink-0">
            <span className="text-[10px] font-mono font-bold text-content-3 tracking-wide w-10">
              {variant.time}
            </span>
            <div className="w-[72px] h-[18px] rounded-full bg-[rgb(var(--color-bg))] flex items-center justify-center">
              <div className="w-[5px] h-[5px] rounded-full bg-content-faint/20 ring-1 ring-content-faint/10" />
            </div>
            <div className="flex items-center gap-1.5 w-10 justify-end">
              {variant.wifi ? (
                <svg className="w-[11px] h-[11px] text-content-muted/60" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 18l-1.4-1.4c.8-.8 1.8-.8 2.8 0L12 18zm-3.5-3.5l-1.4-1.4c2.4-2.4 6.4-2.4 8.8 0l-1.4 1.4c-1.6-1.6-4.4-1.6-6 0zm-3.5-3.5L3.6 9.6c4.6-4.6 12.2-4.6 16.8 0L19 11c-3.8-3.8-10.2-3.8-14 0z" />
                </svg>
              ) : (
                <div className="flex items-end gap-[1px]">
                  <span className="w-[2px] h-[4px] rounded-[0.5px] bg-content-muted/50" />
                  <span className="w-[2px] h-[6px] rounded-[0.5px] bg-content-muted/50" />
                  <span className="w-[2px] h-[8px] rounded-[0.5px] bg-content-muted/50" />
                  <span className="w-[2px] h-[10px] rounded-[0.5px] bg-content-muted/30" />
                </div>
              )}
              <div className="flex items-center">
                <div className="w-[16px] h-[9px] rounded-[2px] border-[1.2px] border-content-muted/40 flex items-center p-[1.5px]">
                  <div className={cn("h-full rounded-[1px]", variant.batteryColor)} style={{ width: "55%" }} />
                </div>
                <div className="w-[1.5px] h-[4px] bg-content-muted/40 rounded-r-full" />
              </div>
            </div>
          </div>

          {/* Separator */}
          <div className="mx-3 h-px bg-surface-border/20 shrink-0" />

          {/* ── Screen content — fills remaining space ── */}
          <div className="flex-1 min-h-0 flex flex-col px-3.5 pt-2.5 pb-2 overflow-hidden">
            {/* Thumbnail — fixed ratio */}
            <div className="aspect-[4/3] relative overflow-hidden rounded-lg bg-surface/60 shrink-0">
              {post.coverUrl ? (
                <>
                  <Image
                    src={post.coverUrl}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 100vw, 300px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-white/0 group-hover:via-white/[0.06] group-hover:to-white/[0.02] transition-all duration-500 pointer-events-none" />
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-accent-pink/8 via-surface to-accent-purple/8 flex items-center justify-center">
                  <span className="text-base text-content-faint/15 select-none">✦</span>
                </div>
              )}
            </div>

            {/* Post info — fills remaining, overflow hidden */}
            <div className="mt-2.5 flex-1 min-h-0 flex flex-col gap-1.5 overflow-hidden">
              <p className="text-[13px] font-semibold text-content-1 leading-snug line-clamp-2 shrink-0 group-hover:text-heading transition-colors duration-200">
                {post.title}
              </p>

              {post.excerpt && (
                <p className="text-[11px] text-content-muted leading-relaxed line-clamp-2 shrink-0">
                  {post.excerpt}
                </p>
              )}

              {/* Tags + date — pushed to bottom */}
              <div className="flex items-center gap-1 mt-auto flex-wrap overflow-hidden shrink-0">
                {post.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-1.5 py-0.5 text-[8px] font-mono font-medium tracking-wider rounded bg-surface-overlay/50 text-content-muted border border-surface-border/30 truncate max-w-[80px]"
                  >
                    {tag}
                  </span>
                ))}
                <time className="text-[9px] text-content-faint font-mono tracking-wider ml-auto shrink-0">
                  {formatShortDate(post.publishedAt ?? post.createdAt)}
                </time>
              </div>
            </div>
          </div>

          {/* ── Home indicator — fixed 24px ── */}
          <div className="flex justify-center h-6 items-center shrink-0">
            <div className="w-[48px] h-[4px] rounded-full bg-content-faint/12 group-hover:bg-content-faint/20 transition-colors duration-300" />
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ─────────────────────────────────────────────
   Other categories: clean list
   ───────────────────────────────────────────── */

function PostList({ posts }: { posts: PostItem[] }) {
  const visible = useStagger(posts.length, 40);

  return (
    <ul>
      {posts.map((post, i) => (
        <li
          key={post.id}
          className="transition-all duration-300 ease-out"
          style={{
            opacity: visible[i] ? 1 : 0,
            transform: visible[i] ? "translateY(0)" : "translateY(8px)",
          }}
        >
          <Link
            href={`/blog/${post.slug}`}
            className={cn(
              "group flex items-baseline gap-4 py-3.5 -mx-3 px-3 rounded-lg transition-all duration-150 hover:bg-surface-raised/40",
              i !== posts.length - 1 && "border-b border-surface-border/15"
            )}
          >
            <time className="text-[10px] text-content-faint font-mono shrink-0 w-20 tabular-nums tracking-wider">
              {formatShortDate(post.publishedAt ?? post.createdAt)}
            </time>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-medium text-content-1 leading-snug truncate group-hover:text-heading transition-colors duration-150">
                {post.title}
              </p>
              {post.excerpt && (
                <p className="mt-0.5 text-[12px] text-content-muted truncate leading-relaxed">
                  {post.excerpt}
                </p>
              )}
            </div>
            <span className="text-[9px] text-content-ghost shrink-0 font-mono group-hover:text-accent-pink/50 transition-all duration-200 group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
