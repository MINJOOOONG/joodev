import { prisma } from "@/lib/db";
import BlogListClient from "./blog-list-client";

export const revalidate = 60;

export const metadata = {
  title: "Blog | JooDev",
  description: "모든 블로그 게시글 목록",
};

interface Props {
  searchParams: Promise<{ category?: string }>;
}

export default async function BlogListPage({ searchParams }: Props) {
  const { category } = await searchParams;

  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    include: { tags: true },
  });

  const categories = Array.from(
    new Set(posts.map((p) => p.category).filter(Boolean))
  );

  return (
    <BlogListClient
      posts={posts}
      categories={categories}
      initialCategory={category ?? null}
    />
  );
}
