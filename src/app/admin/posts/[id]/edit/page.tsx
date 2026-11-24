"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AdminNav from "@/components/ui/admin-nav";
import PostForm from "@/components/editor/post-form";
import AdminLoadError from "@/components/ui/admin-load-error";
import { requestAdmin, isAdminPostData, AdminApiError, type AdminPostData } from "@/lib/admin-api";

export default function EditPostPage() {
  const params = useParams<{ id: string }>();
  const [post, setPost] = useState<AdminPostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AdminApiError | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setPost(null);
    setError(null);
    setLoading(true);
    async function fetchPost() {
      try {
        const data = await requestAdmin(`/api/posts/${params.id}?scope=admin`, { signal: controller.signal }, isAdminPostData);
        if (!controller.signal.aborted) setPost(data);
      } catch (error) {
        if (!controller.signal.aborted) setError(error as AdminApiError);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void fetchPost();
    return () => controller.abort();
  }, [params.id, reloadKey]);

  return (
    <>
      <AdminNav />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        {loading && <p className="text-gray-500">로딩 중...</p>}
        {error && <AdminLoadError error={error} onRetry={() => setReloadKey((key) => key + 1)} />}
        {post && (
          <>
            <h1 className="text-2xl font-bold text-heading mb-6">글 수정</h1>
            <PostForm key={post.id} initialData={post} />
          </>
        )}
      </div>
    </>
  );
}
