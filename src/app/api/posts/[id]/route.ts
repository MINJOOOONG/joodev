import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateSlug } from "@/lib/utils";

interface Context {
  params: Promise<{ id: string }>;
}

// GET /api/posts/[id]
export async function GET(_request: NextRequest, context: Context) {
  const { id } = await context.params;

  const post = await prisma.post.findUnique({
    where: { id },
    include: { tags: { select: { id: true, name: true } } },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json(post);
}

// PUT /api/posts/[id]
export async function PUT(request: NextRequest, context: Context) {
  const { id } = await context.params;

  try {
    const body = await request.json();
    const { title, excerpt, contentJson, coverUrl, images, status, tags } = body;

    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Regenerate slug if title changed or slug is empty
    let slug = existing.slug;
    if ((title && title !== existing.title) || !existing.slug) {
      slug = generateSlug(title);
      const slugExists = await prisma.post.findFirst({
        where: { slug, id: { not: id } },
      });
      if (slugExists) {
        slug = `${slug}-${Date.now().toString(36)}`;
      }
    }

    // Handle publishedAt
    let publishedAt = existing.publishedAt;
    if (status === "PUBLISHED" && !existing.publishedAt) {
      publishedAt = new Date();
    } else if (status === "DRAFT") {
      publishedAt = null;
    }

    // Update tags: delete existing, create new
    await prisma.tag.deleteMany({ where: { postId: id } });

    const post = await prisma.post.update({
      where: { id },
      data: {
        title: title ?? existing.title,
        slug,
        excerpt: excerpt ?? existing.excerpt,
        contentJson: contentJson ?? existing.contentJson,
        coverUrl: coverUrl !== undefined ? coverUrl : existing.coverUrl,
        images: Array.isArray(images) ? images : existing.images,
        status: status ? (status === "PUBLISHED" ? "PUBLISHED" : "DRAFT") : existing.status,
        publishedAt,
        tags: {
          create: (tags as string[] | undefined)?.map((name: string) => ({ name })) || [],
        },
      },
      include: { tags: true },
    });

    return NextResponse.json(post);
  } catch (err) {
    console.error("Update post error:", err);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[id]
export async function DELETE(_request: NextRequest, context: Context) {
  const { id } = await context.params;

  try {
    await prisma.post.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
