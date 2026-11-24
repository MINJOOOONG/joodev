import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateSlug } from "@/lib/utils";
import { isAdminRequest } from "@/lib/session";
import { revalidatePostPages } from "@/lib/revalidate-posts";

interface Context {
  params: Promise<{ id: string }>;
}

// GET /api/posts/[id]
export async function GET(request: NextRequest, context: Context) {
  const { id } = await context.params;
  const isAdmin = await isAdminRequest(request);
  if (request.nextUrl.searchParams.get("scope") === "admin" && !isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const post = await prisma.post.findUnique({
      where: isAdmin ? { id } : { id, status: "PUBLISHED" },
      include: { tags: { select: { id: true, name: true } } },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch {
    return NextResponse.json({ error: "게시글을 불러오지 못했습니다." }, { status: 503 });
  }
}

// PUT /api/posts/[id]
export async function PUT(request: NextRequest, context: Context) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;

  try {
    const body = await request.json();
    const { title, excerpt, contentJson, coverUrl, images, status, tags, category, startDate, endDate } = body;

    if (tags !== undefined && (!Array.isArray(tags) || tags.some((tag) => typeof tag !== "string"))) {
      return NextResponse.json({ error: "Tags must be a list of names" }, { status: 400 });
    }

    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // A published URL is permanent, including when its title is edited.
    let slug = existing.slug;
    if (!slug) {
      slug = generateSlug(title || existing.title);
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

    const tagData = tags === undefined ? undefined
      : Array.from(new Set((tags as string[]).map((name) => name.trim()).filter(Boolean)))
        .map((name) => ({ name }));

    const post = await prisma.$transaction(async (tx) => {
      if (tagData !== undefined) await tx.tag.deleteMany({ where: { postId: id } });
      return tx.post.update({
        where: { id },
        data: {
          title: title ?? existing.title,
          slug,
          excerpt: excerpt ?? existing.excerpt,
          contentJson: contentJson ?? existing.contentJson,
          coverUrl: coverUrl !== undefined ? coverUrl : existing.coverUrl,
          images: Array.isArray(images) ? images : existing.images,
          category: category !== undefined ? category : existing.category,
          status: status ? (status === "PUBLISHED" ? "PUBLISHED" : "DRAFT") : existing.status,
          publishedAt,
          startDate: startDate !== undefined ? (startDate ? new Date(startDate) : null) : existing.startDate,
          endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : existing.endDate,
          tags: tagData === undefined ? undefined : { create: tagData },
        },
        include: { tags: true },
      });
    });

    revalidatePostPages(post.slug, existing.slug);

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
export async function DELETE(request: NextRequest, context: Context) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;

  try {
    const post = await prisma.post.findUnique({ where: { id }, select: { slug: true } });
    await prisma.post.delete({ where: { id } });

    revalidatePostPages(post?.slug);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
