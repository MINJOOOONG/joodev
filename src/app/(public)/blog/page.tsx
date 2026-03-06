import { prisma } from "@/lib/db";
import BlogCard from "@/components/ui/blog-card";
import { PawPrint, SleepingCat } from "@/components/ui/cat-icon";

export const revalidate = 60;

export const metadata = {
  title: "Blog | JooDev",
  description: "모든 블로그 게시글 목록",
};

export default async function BlogListPage() {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    include: { tags: true },
  });

  return (
    <section className="mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-16">
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-2">
          <PawPrint size={14} className="text-accent-purple/40" />
          <span className="text-xs font-semibold uppercase tracking-widest text-accent-purple/50 font-mono">
            All Posts
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Blog
        </h1>
        <p className="mt-2 text-sm text-gray-500 font-mono">
          {posts.length} {posts.length === 1 ? "post" : "posts"}
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="card py-16 text-center">
          <SleepingCat className="mx-auto mb-4" />
          <p className="text-gray-400 font-medium">조용한 밤이에요...</p>
          <p className="text-sm text-gray-500">아직 게시된 글이 없습니다.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
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
    </section>
  );
}
