import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import ExploreClient from "./explore-client";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Explore | JooDev",
  description: "시간의 흐름을 따라 글을 둘러보세요.",
};

export default async function ExplorePage() {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "asc" },
    select: {
      id: true,
      slug: true,
      title: true,
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
  }));

  return <ExploreClient posts={serialized} />;
}
