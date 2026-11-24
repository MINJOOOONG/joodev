"use client";

import Link from "next/link";
import type { AdminApiError } from "@/lib/admin-api";

export default function AdminLoadError({ error, onRetry }: { error: AdminApiError; onRetry: () => void }) {
  return (
    <div role="alert" className="card p-6 space-y-4">
      <p className="text-sm text-red-400">{error.message}</p>
      <div className="flex gap-3">
        {error.status === 401 ? (
          <Link href="/admin/login" className="btn-primary text-xs">다시 로그인</Link>
        ) : (
          <button type="button" onClick={onRetry} className="btn-secondary text-xs">다시 시도</button>
        )}
        <Link href="/admin/posts" className="btn-ghost text-xs">게시글 목록</Link>
      </div>
    </div>
  );
}
