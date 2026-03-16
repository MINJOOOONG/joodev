"use client";

import { useState, useMemo } from "react";
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
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = useMemo(
    () => activeCategory ? posts.filter((p) => p.category === activeCategory) : posts,
    [posts, activeCategory]
  );

  return (
    <section className="mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-16">
      <div className="mb-12">
        <div className="mb-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent-purple/50 font-mono">
            All Posts
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-heading">
          Blog
        </h1>
        <p className="mt-2 text-sm text-content-muted font-mono">
          {filtered.length} {filtered.length === 1 ? "post" : "posts"}
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
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
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
            />
          ))}
        </div>
      )}
    </section>
  );
}
