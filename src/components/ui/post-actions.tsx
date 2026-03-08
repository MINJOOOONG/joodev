"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "./auth-provider";

export default function PostActions({ postId }: { postId: string }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  if (!isAuthenticated) return null;

  const handleDelete = async () => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/blog");
    } else {
      alert("삭제에 실패했습니다.");
    }
  };

  return (
    <div className="flex items-center gap-1.5 shrink-0 ml-4">
      <Link
        href={`/admin/posts/${postId}/edit`}
        className="rounded-lg px-3 py-1.5 text-xs font-medium text-content-3 border border-surface-border hover:bg-surface-raised hover:text-heading transition-all duration-200"
      >
        수정
      </Link>
      <button
        onClick={handleDelete}
        className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-400/60 border border-red-400/20 hover:bg-red-400/10 hover:text-red-400 transition-all duration-200"
      >
        삭제
      </button>
    </div>
  );
}
