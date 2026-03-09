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
      router.replace("/blog");
      router.refresh();
    } else {
      alert("삭제에 실패했습니다.");
    }
  };

  return (
    <div className="flex items-center gap-1.5 shrink-0 ml-4">
      <Link
        href={`/admin/posts/${postId}/edit`}
        className="btn-ghost py-1.5 px-3 text-xs"
      >
        수정
      </Link>
      <button
        onClick={handleDelete}
        className="btn-danger"
      >
        삭제
      </button>
    </div>
  );
}
