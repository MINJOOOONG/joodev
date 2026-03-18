"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import BlogCard from "@/components/ui/blog-card";
import { SleepingCat } from "@/components/ui/cat-icon";

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverUrl: string | null;
  category: string;
  publishedAt: Date | string | null;
  createdAt: Date | string;
  tags: { name: string }[];
}

interface BlogListClientProps {
  posts: Post[];
  categories: string[];
}

export default function BlogListClient({ posts, categories }: BlogListClientProps) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");
  const [activeCategory, setActiveCategory] = useState<string | null>(
    initialCategory && categories.includes(initialCategory) ? initialCategory : null
  );

  const filtered = useMemo(
    () => activeCategory ? posts.filter((p) => p.category === activeCategory) : posts,
    [posts, activeCategory]
  );

  return (
    <section className="mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-16">
      <div className="mb-10">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent-purple/15 bg-accent-purple/[0.05] px-4 py-1.5 text-xs font-semibold text-accent-purple backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-purple animate-pulse" />
          All Posts
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-heading">
          Blog
        </h1>
        <p className="mt-2 text-sm text-content-muted font-mono">
          {filtered.length} {filtered.length === 1 ? "post" : "posts"}
          {activeCategory && (
            <span className="text-accent-purple/60"> in {activeCategory}</span>
          )}
        </p>
      </div>

      {/* Category filter */}
      {categories.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors duration-200 border ${
                activeCategory === cat
                  ? "bg-accent-purple/15 text-accent-purple border-accent-purple/30"
                  : "bg-surface-raised text-content-3 border-surface-border hover:border-surface-border-light hover:text-content-2"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="card py-16 text-center">
          <SleepingCat className="mx-auto mb-4" />
          <p className="text-content-3 font-medium">조용한 밤이에요...</p>
          <p className="text-sm text-content-muted">아직 게시된 글이 없습니다.</p>
        </div>
      ) : (
        <>
          {/* List view for non-Daily posts */}
          {filtered.some((p) => p.category !== "Daily") && (
            <div className="card mb-8 divide-y-0 px-5">
              {filtered
                .filter((p) => p.category !== "Daily")
                .map((post) => (
                  <BlogCard
                    key={post.id}
                    id={post.id}
                    slug={post.slug}
                    title={post.title}
                    excerpt={post.excerpt}
                    category={post.category}
                    publishedAt={post.publishedAt ?? post.createdAt}
                    tags={post.tags}
                    variant="list"
                  />
                ))}
            </div>
          )}

          {/* Card grid for Daily posts */}
          {filtered.some((p) => p.category === "Daily") && (
            <>
              {filtered.some((p) => p.category !== "Daily") && (
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-accent-purple/50 font-mono">
                  Daily
                </h2>
              )}
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filtered
                  .filter((p) => p.category === "Daily")
                  .map((post) => (
                    <BlogCard
                      key={post.id}
                      id={post.id}
                      slug={post.slug}
                      title={post.title}
                      excerpt={post.excerpt}
                      coverUrl={post.coverUrl}
                      category={post.category}
                      publishedAt={post.publishedAt ?? post.createdAt}
                      tags={post.tags}
                      variant="card"
                    />
                  ))}
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}
