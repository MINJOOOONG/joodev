"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { useAuth } from "./auth-provider";

interface BlogCardProps {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverUrl?: string | null;
  category?: string;
  publishedAt: Date | string;
  tags: { name: string }[];
}

export default function BlogCard({
  id,
  slug,
  title,
  excerpt,
  coverUrl,
  category,
  publishedAt,
  tags,
}: BlogCardProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    } else {
      alert("삭제에 실패했습니다.");
    }
  };

  return (
    <article className="group card overflow-hidden hover:border-accent-purple/25 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
      {coverUrl ? (
        <Link href={`/blog/${slug}`} className="block overflow-hidden">
          <Image
            src={coverUrl}
            alt={title}
            width={600}
            height={340}
            className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </Link>
      ) : (
        <Link
          href={`/blog/${slug}`}
          className="flex h-36 items-center justify-center bg-gradient-to-br from-accent-purple/[0.06] via-surface to-accent-pink/[0.04] relative overflow-hidden"
        >
          <div className="relative flex items-center gap-1 text-accent-purple/25 font-mono text-sm">
            <span>&lt;/&gt;</span>
          </div>
        </Link>
      )}
      <div className="flex flex-1 flex-col p-5">
        {(category && category !== "Uncategorized") && (
          <span className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-accent-purple/70">
            {category}
          </span>
        )}
        {tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span key={tag.name} className="tag">{tag.name}</span>
            ))}
          </div>
        )}

        <Link href={`/blog/${slug}`}>
          <h2 className="mb-2 text-[15px] font-bold leading-snug text-heading group-hover:text-accent-purple transition-colors duration-200 line-clamp-2">
            {title}
          </h2>
        </Link>

        <p className="mb-4 flex-1 text-sm leading-relaxed text-content-muted line-clamp-2">
          {excerpt}
        </p>

        <div className="flex items-center justify-between pt-3">
          <time
            className="text-xs text-content-faint font-mono"
            dateTime={new Date(publishedAt).toISOString()}
          >
            {formatDate(publishedAt)}
          </time>
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <>
                <Link
                  href={`/admin/posts/${id}/edit`}
                  className="text-xs font-medium text-content-muted hover:text-accent-purple transition-colors duration-200"
                >
                  수정
                </Link>
                <button
                  onClick={handleDelete}
                  className="text-xs font-medium text-content-muted hover:text-red-400 transition-colors duration-200"
                >
                  삭제
                </button>
                <span className="h-3 w-px bg-surface-border/40" />
              </>
            )}
            <Link
              href={`/blog/${slug}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-accent-purple/60 group-hover:text-accent-purple transition-colors duration-200"
            >
              Read
              <svg className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
