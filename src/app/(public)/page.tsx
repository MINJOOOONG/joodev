import Link from "next/link";
import { prisma } from "@/lib/db";
import BlogCard from "@/components/ui/blog-card";
import { PixelCat, PawPrint, SleepingCat } from "@/components/ui/cat-icon";

export const revalidate = 60;

export default async function HomePage() {
  const recentPosts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 6,
    include: { tags: true },
  });

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-accent-purple/[0.03] via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-accent-purple/[0.04] rounded-full blur-[100px]" />
        <div className="absolute top-20 right-20 w-[300px] h-[300px] bg-accent-pink/[0.03] rounded-full blur-[80px]" />

        {/* Floating paw decorations */}
        <div className="absolute top-16 right-[15%] text-accent-purple/8 animate-float">
          <PawPrint size={28} className="rotate-[30deg]" />
        </div>
        <div className="absolute top-40 left-[10%] text-accent-pink/6 animate-float-slow">
          <PawPrint size={20} className="rotate-[-15deg]" />
        </div>
        <div className="absolute bottom-20 right-[25%] text-accent-purple/5 animate-float" style={{ animationDelay: "2s" }}>
          <PawPrint size={16} className="rotate-[45deg]" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 py-24 sm:py-32">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-16">
            <div className="max-w-xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent-purple/15 bg-accent-purple/[0.05] px-4 py-1.5 text-xs font-semibold text-accent-purple backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-purple animate-pulse" />
                Welcome to my blog
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-[56px] lg:leading-[1.1]">
                Code, Coffee,
                <span className="bg-gradient-to-r from-accent-purple via-accent-pink to-accent-blue bg-clip-text text-transparent">
                  {" "}& Cats
                </span>
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-gray-400">
                개발하면서 배운 것들, 삽질한 경험들,
                <br className="hidden sm:block" />
                그리고 고양이처럼 우아한 코드에 대한 이야기.
              </p>
              <div className="mt-8 flex items-center gap-3">
                <Link href="/blog" className="btn-primary">
                  블로그 구경하기
                </Link>
                <Link href="/admin/posts/new" className="btn-secondary">
                  글 쓰기
                </Link>
              </div>

              {/* Terminal-style decoration */}
              <div className="mt-12 rounded-2xl border border-surface-border/60 bg-dark-975/80 p-5 font-mono text-sm max-w-md backdrop-blur-sm shadow-inner">
                <div className="flex items-center gap-1.5 mb-3.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400/50" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/50" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-400/50" />
                </div>
                <div className="space-y-0.5 text-[13px]">
                  <div>
                    <span className="text-accent-purple">const</span>{" "}
                    <span className="text-accent-mint">blog</span>{" "}
                    <span className="text-gray-600">=</span>{" "}
                    <span className="text-accent-orange">{`{`}</span>
                  </div>
                  <div className="pl-4">
                    <span className="text-accent-blue">author</span>
                    <span className="text-gray-600">:</span>{" "}
                    <span className="text-accent-orange">&apos;JooDev&apos;</span>
                    <span className="text-gray-600">,</span>
                  </div>
                  <div className="pl-4">
                    <span className="text-accent-blue">mood</span>
                    <span className="text-gray-600">:</span>{" "}
                    <span className="text-accent-orange">&apos;~(=^..^)&apos;</span>
                    <span className="text-gray-600">,</span>
                  </div>
                  <div className="pl-4">
                    <span className="text-accent-blue">coffee</span>
                    <span className="text-gray-600">:</span>{" "}
                    <span className="text-accent-purple">Infinity</span>
                  </div>
                  <div>
                    <span className="text-accent-orange">{`}`}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hero Cat - pixel fat cat (same as header logo) */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-white/[0.03] rounded-full blur-3xl scale-75" />
                <div className="relative animate-float-slow">
                  <PixelCat size={220} />
                </div>
                {/* Floating code badge */}
                <div className="absolute -top-2 -right-4 rounded-xl border border-surface-border-light/60 bg-surface-raised/90 px-3 py-1.5 shadow-soft text-xs font-mono text-accent-mint animate-float backdrop-blur-sm">
                  meow( )
                </div>
                <div className="absolute -bottom-1 -left-6 rounded-xl border border-surface-border-light/60 bg-surface-raised/90 px-3 py-1.5 shadow-soft animate-float backdrop-blur-sm" style={{ animationDelay: "1.5s" }}>
                  <span className="text-accent-pink text-xs font-mono">purr.js</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="relative h-px">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent-purple/20 to-transparent" />
      </div>

      {/* Recent posts */}
      <section className="relative">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-24">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <PawPrint size={14} className="text-accent-purple/40" />
                <span className="text-xs font-semibold uppercase tracking-widest text-accent-purple/50 font-mono">
                  Latest Posts
                </span>
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-white">
                최근 게시글
              </h2>
            </div>
            <Link
              href="/blog"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-accent-purple/70 hover:text-accent-purple transition-colors duration-200"
            >
              전체 보기
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {recentPosts.length === 0 ? (
            <div className="card py-16 text-center">
              <SleepingCat className="mx-auto mb-4" />
              <p className="text-gray-400 mb-1 font-medium">조용한 밤이에요...</p>
              <p className="text-sm text-gray-500 mb-6">아직 게시된 글이 없습니다.</p>
              <Link href="/admin/posts/new" className="btn-primary">
                첫 글 작성하기
              </Link>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {recentPosts.map((post) => (
                <BlogCard
                  key={post.id}
                  id={post.id}
                  slug={post.slug}
                  title={post.title}
                  excerpt={post.excerpt}
                  coverUrl={post.coverUrl}
                  publishedAt={post.publishedAt ?? post.createdAt}
                  tags={post.tags}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
