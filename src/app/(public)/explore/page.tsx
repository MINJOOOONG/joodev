import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import Link from "next/link";
import ExploreContent from "./explore-content";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Explore | JooDev",
  description: "카테고리별 글을 둘러보세요.",
};

export default async function ExplorePage() {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverUrl: true,
      category: true,
      publishedAt: true,
      createdAt: true,
      tags: { select: { name: true } },
    },
  });

  const serialized = posts.map((p) => ({
    ...p,
    publishedAt: p.publishedAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
    tags: p.tags.map((t) => t.name),
  }));

  return (
    <section className="py-14 sm:py-20">
      {/* Header */}
      <div className="mb-14 sm:mb-16 text-center px-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tighter text-heading">
          Digging Log
        </h1>
        <p className="mt-2 text-[12px] text-content-faint max-w-xs mx-auto leading-relaxed tracking-widest uppercase font-mono">
          trials, errors &amp; breakthroughs
        </p>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <ExploreContent posts={serialized} />
      </div>

      {/* Footer link */}
      <p className="mt-16 sm:mt-24 text-center text-xs text-content-faint tracking-wide">
        &mdash; or browse{" "}
        <Link
          href="/blog"
          className="text-content-muted hover:text-content-3 transition-colors underline underline-offset-2 decoration-content-faint/30 hover:decoration-content-muted/50"
        >
          all posts
        </Link>
      </p>
    </section>
  );
}
