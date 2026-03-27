import { cache } from "react";
import { prisma } from "@/lib/db";

export const getPostBySlug = cache(async (slug: string) => {
  return prisma.post.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: { tags: true },
  });
});
