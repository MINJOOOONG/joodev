import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import CategoryShelf from "./category-shelf";

export const revalidate = 3600;

const VALID_CATEGORIES: Record<string, string> = {
  backend: "Backend",
  frontend: "Frontend",
  qa: "QA",
  devops: "DevOps",
  review: "Review",
  experiences: "Experiences",
  daily: "Daily",
  uncategorized: "Uncategorized",
};

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    select: { category: true },
    distinct: ["category"],
  });
  return posts.map((p) => ({ category: p.category.toLowerCase() }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const label = VALID_CATEGORIES[category];
  return {
    title: label ? `${label} | Explore | JooDev` : "Not Found",
    description: label ? `${label} 카테고리의 글 모음` : undefined,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const label = VALID_CATEGORIES[category];
  if (!label) notFound();

  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED", category: label },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      coverUrl: true,
      publishedAt: true,
      createdAt: true,
      tags: { select: { name: true } },
    },
  });

  if (posts.length === 0) notFound();

  const serialized = posts.map((p) => ({
    ...p,
    publishedAt: p.publishedAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
  }));

  return <CategoryShelf category={label} posts={serialized} />;
}
