import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import HomeHero from "./home-hero";

export const revalidate = 60;

async function loadRecentPosts() {
  try {
    const posts = await prisma.post.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        category: true,
        publishedAt: true,
        createdAt: true,
      },
    });
    return { posts, unavailable: false };
  } catch {
    return { posts: [], unavailable: true };
  }
}

export default async function HomePage() {
  const { posts, unavailable } = await loadRecentPosts();

  return (
    <>
      <HomeHero />
      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 sm:pb-24" aria-labelledby="recent-posts-heading">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="recent-posts-heading" className="text-2xl font-bold text-heading">최근에 쓴 글</h2>
            <p className="mt-2 text-sm text-content-3">새로 배운 것과 기록하고 싶은 이야기들.</p>
          </div>
          <Link href="/explore" className="btn-secondary">전체 글 보기</Link>
        </div>
        {posts.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3">
            {posts.map((post) => {
              const date = post.publishedAt ?? post.createdAt;
              return (
                <Link key={post.id} href={`/blog/${post.slug}`} className="card group flex h-full flex-col p-6 hover:border-accent-purple/40">
                  <span className="mb-3 text-sm font-semibold text-accent-purple">{post.category}</span>
                  <h3 className="text-lg font-bold leading-relaxed text-heading group-hover:text-accent-purple">{post.title}</h3>
                  {post.excerpt && <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-content-3">{post.excerpt}</p>}
                  <time className="mt-auto pt-5 text-xs text-content-muted" dateTime={date.toISOString()}>{formatDate(date)}</time>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="card px-6 py-10 text-center text-sm leading-relaxed text-content-3">
            {unavailable ? "최근 글을 불러오지 못했어요. 잠시 후 다시 확인해 주세요." : "아직 게시된 글이 없어요. 첫 번째 이야기를 준비하고 있어요."}
          </p>
        )}
      </section>
    </>
  );
}
