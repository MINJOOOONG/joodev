import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import Link from "next/link";
import ShelfCard from "./shelf-card";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Explore | JooDev",
  description: "카테고리별 서재를 둘러보세요.",
};

const CATEGORY_META: Record<string, { color: string; accent: string; desc: string }> = {
  Backend:     { color: "#5B8DEF", accent: "#3D5FA3", desc: "서버, API, 아키텍처, 트랜잭션" },
  Frontend:    { color: "#4DD4C0", accent: "#2E9586", desc: "UI, 컴포넌트, 브라우저" },
  QA:          { color: "#6BCB77", accent: "#43904F", desc: "테스트, 자동화, 품질" },
  DevOps:      { color: "#F09D51", accent: "#B87036", desc: "CI/CD, 인프라, 배포" },
  Review:      { color: "#A78BFA", accent: "#7058B8", desc: "코드 리뷰, 회고" },
  Experiences: { color: "#F7C948", accent: "#BD9832", desc: "경험, 여정, 성장기" },
  Daily:       { color: "#F472B6", accent: "#B44B82", desc: "일상, 기록, 잡담" },
};
const DEFAULT_META = { color: "#9CA3AF", accent: "#656C78", desc: "기타 글" };

export default async function ExplorePage() {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    select: { category: true },
  });

  const counts = new Map<string, number>();
  for (const p of posts) {
    counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
  }

  const categories = Array.from(counts.entries())
    .sort((a, b) => {
      if (a[0] === "Uncategorized") return 1;
      if (b[0] === "Uncategorized") return -1;
      return b[1] - a[1];
    });

  return (
    <section className="relative py-12 sm:py-20 overflow-hidden">
      {/* Header */}
      <div className="relative mb-14 sm:mb-20 text-center px-4">
        <div
          className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 text-xs font-bold text-yellow-300/80"
          style={{
            background: "#2a2235",
            border: "3px solid #F7C94866",
            boxShadow: "3px 3px 0 rgba(247,201,72,0.2)",
          }}
        >
          {/* 작은 별 */}
          <span className="relative">
            <span className="block w-[6px] h-[6px] bg-yellow-300/70" />
            <span className="absolute -top-[3px] left-[1.5px] w-[3px] h-[3px] bg-yellow-300/40" />
            <span className="absolute -left-[3px] top-[1.5px] w-[3px] h-[3px] bg-yellow-300/40" />
          </span>
          Library
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white/90">
          Explore
        </h1>
        <p className="mt-3 text-sm text-white/35 max-w-sm mx-auto leading-relaxed">
          어떤 서재를 둘러볼까요?
        </p>
      </div>

      {/* Category shelves grid */}
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          {categories.map(([cat, count]) => {
            const meta = CATEGORY_META[cat] ?? DEFAULT_META;
            return (
              <ShelfCard
                key={cat}
                category={cat}
                count={count}
                color={meta.color}
                accent={meta.accent}
                desc={meta.desc}
              />
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <p className="relative mt-14 sm:mt-20 text-center text-xs text-white/25 font-mono tracking-wide">
        &mdash; or browse{" "}
        <Link
          href="/blog"
          className="text-white/35 hover:text-white/55 transition-colors underline underline-offset-2 decoration-white/15 hover:decoration-white/30"
        >
          all posts
        </Link>
      </p>
    </section>
  );
}
