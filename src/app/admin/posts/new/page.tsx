"use client";

import AdminNav from "@/components/ui/admin-nav";
import PostForm from "@/components/editor/post-form";

export default function NewPostPage() {
  return (
    <>
      <AdminNav />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">새 글 작성</h1>
        <PostForm />
      </div>
    </>
  );
}
