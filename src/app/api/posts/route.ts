import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { generateSlug } from "@/lib/utils";

// GET /api/posts - list all posts (admin: all, public: published only)
export async function GET(request: NextRequest) {
  const isAdmin = request.cookies.get("admin_session")?.value;

  const posts = await prisma.post.findMany({
    where: isAdmin ? {} : { status: "PUBLISHED" },
    orderBy: { updatedAt: "desc" },
    include: { tags: { select: { name: true } } },
  });

  return NextResponse.json(posts);
}

// POST /api/posts - create a new post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, excerpt, contentJson, coverUrl, images, status, tags, category, startDate, endDate } = body;

    if (!title || typeof title !== "string") {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    let slug = generateSlug(title);

    // Ensure unique slug
    const existing = await prisma.post.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        excerpt: excerpt || "",
        contentJson: contentJson || {},
        coverUrl: coverUrl || null,
        images: Array.isArray(images) ? images : [],
        category: category || "Uncategorized",
        status: status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
        publishedAt: status === "PUBLISHED" ? new Date() : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        tags: {
          create: (tags as string[] | undefined)?.map((name: string) => ({ name })) || [],
        },
      },
      include: { tags: true },
    });

    // Revalidate blog pages so navigation after publish is instant
    revalidatePath("/blog");
    revalidatePath("/explore");
    if (post.slug) {
      revalidatePath(`/blog/${post.slug}`);
    }

    return NextResponse.json(post, { status: 201 });
  } catch (err) {
    console.error("Create post error:", err);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
