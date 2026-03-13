"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AdminNav from "@/components/ui/admin-nav";
import PostForm from "@/components/editor/post-form";
import type { JSONContent } from "@tiptap/react";

interface PostData {
  id: string;
  title: string;
  excerpt: string;
  contentJson: JSONContent;
  coverUrl: string | null;
  images: string[];
  category: string;
  status: "DRAFT" | "PUBLISHED";
  tags: { name: string }[];
  startDate: string | null;
  endDate: string | null;
}

export default function EditPostPage() {
  const params = useParams();
  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`/api/posts/${params.id}`);
        if (!res.ok) {
          setError("게시글을 찾을 수 없습니다.");
          return;
        }
        const data = await res.json();
        setPost(data);
      } catch {
        setError("게시글 로딩에 실패했습니다.");
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [params.id]);

  return (
    <>
      <AdminNav />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        {loading && <p className="text-gray-500">로딩 중...</p>}
        {error && <p className="text-red-400">{error}</p>}
        {post && (
          <>
            <h1 className="text-2xl font-bold text-white mb-6">글 수정</h1>
            <PostForm initialData={post} />
          </>
        )}
      </div>
    </>
  );
}
