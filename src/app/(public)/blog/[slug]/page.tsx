import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import PostRenderer from "@/components/ui/post-renderer";
import Link from "next/link";
import Image from "next/image";
import { CatFace, PawPrint } from "@/components/ui/cat-icon";
import PostActions from "@/components/ui/post-actions";
import type { Metadata } from "next";
import type { JSONContent } from "@tiptap/react";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug },
    select: { title: true, excerpt: true },
  });

  if (!post) return { title: "Not Found" };

  return {
    title: `${post.title} | JooDev`,
    description: post.excerpt,
  };
}

export default async function PostDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: { tags: true },
  });

  if (!post) notFound();

  return (
    <article className="animate-fade-in-up">
      {/* Cover Image */}
      {post.coverUrl && (
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 pt-8">
          <div className="relative aspect-[2/1] overflow-hidden rounded-2xl border border-surface-border/50">
            <Image
              src={post.coverUrl}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[680px] px-4 sm:px-6 py-12 sm:py-16">
        {/* Back link */}
        <Link
          href="/blog"
          className="group mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-accent-purple transition-colors duration-200"
        >
          <svg className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          블로그로 돌아가기
        </Link>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {post.tags.map((tag) => (
              <span key={tag.id} className="tag">
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-[40px] lg:leading-[1.15] mb-6">
          {post.title}
        </h1>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-lg text-gray-400 leading-relaxed mb-8">
            {post.excerpt}
          </p>
        )}

        {/* Admin actions */}
        <PostActions postId={post.id} />

        {/* Author + Date */}
        <div className="flex items-center gap-3 mb-10 pb-8 border-b border-surface-border/60">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-accent-purple/20 to-accent-pink/10 border border-surface-border-light">
            <CatFace size={22} className="text-accent-purple" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-200">JooDev</p>
            <div className="flex items-center gap-1.5">
              <time
                className="text-xs text-gray-500"
                dateTime={(post.publishedAt ?? post.createdAt).toISOString()}
              >
                {formatDate(post.publishedAt ?? post.createdAt)}
              </time>
            </div>
          </div>
        </div>

        {/* Content */}
        <PostRenderer content={post.contentJson as JSONContent} />

        {/* Bottom nav */}
        <div className="mt-16 pt-8 border-t border-surface-border/60 text-center">
          <div className="flex items-center justify-center gap-3 text-accent-purple/15 mb-4">
            <PawPrint size={10} className="rotate-[-20deg]" />
            <PawPrint size={12} className="rotate-[10deg]" />
            <PawPrint size={10} className="rotate-[-5deg]" />
          </div>
          <p className="text-sm text-gray-500 mb-5">읽어주셔서 감사합니다!</p>
          <Link href="/blog" className="btn-secondary text-xs">
            다른 글 보기
          </Link>
        </div>
      </div>
    </article>
  );
}
