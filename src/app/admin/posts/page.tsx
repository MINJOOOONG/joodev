"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminNav from "@/components/ui/admin-nav";
import { formatDate } from "@/lib/utils";
import { SleepingCat } from "@/components/ui/cat-icon";

interface Post {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  tags: { name: string }[];
}

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    setLoading(true);
    const res = await fetch("/api/posts");
    const data = await res.json();
    setPosts(data);
    setLoading(false);
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`"${title}" 게시글을 삭제하시겠습니까?`)) return;

    const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p.id !== id));
    }
  }

  const filtered = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <>
      <AdminNav />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        {/* Page header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-heading">
              게시글 관리
            </h1>
            <p className="mt-0.5 text-sm text-content-muted">
              총 {posts.length}개의 게시글
            </p>
          </div>
          <Link href="/admin/posts/new" className="btn-primary">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            새 글 작성
          </Link>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <svg className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-content-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="제목 또는 태그로 검색..."
              className="input-field pl-10"
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="card flex items-center justify-center py-20 text-content-3">
            <svg className="mr-2 h-5 w-5 animate-spin text-accent-purple" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            로딩 중...
          </div>
        ) : filtered.length === 0 ? (
          <div className="card py-16 text-center">
            <SleepingCat className="mx-auto mb-4" />
            <p className="text-sm text-content-3 font-medium">
              {search ? "검색 결과가 없어요..." : "아직 게시글이 없어요..."}
            </p>
            <p className="text-xs text-content-muted mt-1">
              {search ? "다른 키워드로 검색해 보세요." : "새 글을 작성해 보세요!"}
            </p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="min-w-full divide-y divide-surface-border">
              <thead>
                <tr className="bg-surface-raised/50">
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-content-muted uppercase tracking-wider">
                    제목
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-content-muted uppercase tracking-wider">
                    상태
                  </th>
                  <th className="hidden md:table-cell px-5 py-3.5 text-left text-[11px] font-semibold text-content-muted uppercase tracking-wider">
                    카테고리
                  </th>
                  <th className="hidden md:table-cell px-5 py-3.5 text-left text-[11px] font-semibold text-content-muted uppercase tracking-wider">
                    태그
                  </th>
                  <th className="hidden sm:table-cell px-5 py-3.5 text-left text-[11px] font-semibold text-content-muted uppercase tracking-wider">
                    수정일
                  </th>
                  <th className="px-5 py-3.5 text-right text-[11px] font-semibold text-content-muted uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/50">
                {filtered.map((post) => (
                  <tr key={post.id} className="hover:bg-surface-raised/30 transition-colors duration-150">
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="text-sm font-semibold text-content-1 hover:text-accent-purple transition-colors duration-200"
                      >
                        {post.title || "제목 없음"}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold ${
                          post.status === "PUBLISHED"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {post.status === "PUBLISHED" ? "발행" : "초안"}
                      </span>
                    </td>
                    <td className="hidden md:table-cell px-5 py-4">
                      <span className="text-xs text-content-3 font-medium">
                        {post.category || "—"}
                      </span>
                    </td>
                    <td className="hidden md:table-cell px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {post.tags.map((tag) => (
                          <span key={tag.name} className="tag">
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-5 py-4 text-xs text-content-muted font-mono">
                      {formatDate(post.updatedAt)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/posts/${post.id}/edit`}
                          className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-accent-purple/70 hover:bg-accent-purple/10 hover:text-accent-purple transition-colors duration-200"
                        >
                          수정
                        </Link>
                        <button
                          onClick={() => handleDelete(post.id, post.title)}
                          className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-colors duration-200"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </>
  );
}
