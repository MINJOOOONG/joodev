import { prisma } from "@/lib/db";
import ExploreClient from "./explore-client";

export const revalidate = 60;

export const metadata = {
  title: "Explore | JooDev",
  description: "블로그 타임라인 탐색",
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
      startDate: true,
      endDate: true,
      publishedAt: true,
      tags: { select: { name: true } },
    },
  });

  return <ExploreClient posts={posts} />;
}
