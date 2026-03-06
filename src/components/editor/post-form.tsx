"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Image from "next/image";
import type { JSONContent } from "@tiptap/react";
import { useToast } from "@/components/ui/toast";

const TipTapEditor = dynamic(() => import("./tiptap-editor"), {
  ssr: false,
  loading: () => (
    <div className="card p-8 text-center text-gray-300">
      에디터 로딩 중...
    </div>
  ),
});

const PostRenderer = dynamic(
  () => import("@/components/ui/post-renderer"),
  { ssr: false }
);

const MAX_IMAGES = 10;

interface PostFormProps {
  initialData?: {
    id: string;
    title: string;
    excerpt: string;
    contentJson: JSONContent;
    coverUrl: string | null;
    images: string[];
    status: "DRAFT" | "PUBLISHED";
    tags: { name: string }[];
  };
}

export default function PostForm({ initialData }: PostFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? "");
  const [images, setImages] = useState<string[]>(initialData?.images ?? []);
  const [coverUrl, setCoverUrl] = useState(initialData?.coverUrl ?? "");
  const [tags, setTags] = useState(
    initialData?.tags.map((t) => t.name).join(", ") ?? ""
  );
  const [content, setContent] = useState<JSONContent>(
    initialData?.contentJson ?? { type: "doc", content: [{ type: "paragraph" }] }
  );
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(
    initialData?.status ?? "DRAFT"
  );
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEdit = !!initialData?.id;

  // Dirty state tracking
  const [isDirty, setIsDirty] = useState(false);
  const lastSavedRef = useRef({
    title: initialData?.title ?? "",
    excerpt: initialData?.excerpt ?? "",
    tags: initialData?.tags.map((t) => t.name).join(", ") ?? "",
    images: initialData?.images ?? [],
    coverUrl: initialData?.coverUrl ?? "",
  });

  // Mark dirty when any field changes
  useEffect(() => {
    const saved = lastSavedRef.current;
    const dirty =
      title !== saved.title ||
      excerpt !== saved.excerpt ||
      tags !== saved.tags ||
      coverUrl !== saved.coverUrl ||
      JSON.stringify(images) !== JSON.stringify(saved.images);
    setIsDirty(dirty);
  }, [title, excerpt, tags, images, coverUrl]);

  // Content change also marks dirty
  const contentDirtyRef = useRef(false);
  const handleContentChange = useCallback((json: JSONContent) => {
    setContent(json);
    contentDirtyRef.current = true;
    setIsDirty(true);
  }, []);

  // Unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty || contentDirtyRef.current) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Mark as clean after save
  const markClean = useCallback(() => {
    lastSavedRef.current = { title, excerpt, tags, images, coverUrl };
    contentDirtyRef.current = false;
    setIsDirty(false);
  }, [title, excerpt, tags, images, coverUrl]);

  const handleSave = useCallback(
    async (saveStatus?: "DRAFT" | "PUBLISHED") => {
      const targetStatus = saveStatus ?? status;

      if (!title.trim()) {
        toast("제목을 입력해주세요.", "error");
        return;
      }

      if (targetStatus === "PUBLISHED") {
        const hasContent =
          content?.content?.some(
            (node) =>
              node.type !== "paragraph" ||
              (node.content && node.content.length > 0)
          ) ?? false;

        if (!hasContent) {
          toast("본문 내용을 입력해주세요.", "error");
          return;
        }
      }

      setSaving(true);

      try {
        const tagList = tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);

        const finalCoverUrl = coverUrl || images[0] || null;

        const body = {
          title,
          excerpt,
          contentJson: content,
          coverUrl: finalCoverUrl,
          images,
          status: targetStatus,
          tags: tagList,
        };

        const url = isEdit ? `/api/posts/${initialData!.id}` : "/api/posts";
        const method = isEdit ? "PUT" : "POST";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const data = await res.json();
          toast(data.error || "저장에 실패했습니다.", "error");
          return;
        }

        const data = await res.json();
        markClean();

        if (!isEdit) {
          router.push(`/admin/posts/${data.id}/edit`);
        }

        toast(
          targetStatus === "PUBLISHED" ? "글이 발행되었습니다." : "초안이 저장되었습니다.",
          "success"
        );
      } catch {
        toast("저장에 실패했습니다.", "error");
      } finally {
        setSaving(false);
      }
    },
    [title, excerpt, content, coverUrl, images, status, tags, isEdit, initialData, router, toast, markClean]
  );

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      toast(`이미지는 최대 ${MAX_IMAGES}장까지 첨부할 수 있습니다.`, "info");
      e.target.value = "";
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remaining);
    if (files.length > remaining) {
      toast(`${remaining}장만 추가로 업로드할 수 있습니다. (최대 ${MAX_IMAGES}장)`, "info");
    }

    setUploading(true);
    const newImages: string[] = [];

    for (const file of filesToUpload) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (res.ok) {
          newImages.push(data.url);
        } else {
          toast("이미지 업로드에 실패했습니다.", "error");
        }
      } catch {
        toast("이미지 업로드에 실패했습니다.", "error");
      }
    }

    if (newImages.length > 0) {
      setImages((prev) => {
        const updated = [...prev, ...newImages];
        if (!coverUrl) {
          setCoverUrl(updated[0]);
        }
        return updated;
      });
    }

    setUploading(false);
    e.target.value = "";
  }, [images.length, coverUrl, toast]);

  const removeImage = useCallback((url: string) => {
    setImages((prev) => prev.filter((img) => img !== url));
    if (coverUrl === url) {
      setCoverUrl((prev) => {
        const remaining = images.filter((img) => img !== url);
        return remaining[0] || "";
      });
    }
  }, [coverUrl, images]);

  return (
    <div className="space-y-5">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-semibold ${
              status === "PUBLISHED"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
            }`}
          >
            {status === "PUBLISHED" ? "발행됨" : "초안"}
          </span>
          {isDirty && (
            <span className="text-xs text-gray-500">수정됨</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreview(!preview)}
            className="btn-ghost text-xs"
          >
            {preview ? "편집" : "미리보기"}
          </button>
          <button
            type="button"
            onClick={() => handleSave("DRAFT")}
            disabled={saving}
            className="btn-secondary !py-1.5 !px-3 !text-xs !rounded-xl"
          >
            초안 저장
          </button>
          <button
            type="button"
            onClick={() => {
              setStatus("PUBLISHED");
              handleSave("PUBLISHED");
            }}
            disabled={saving}
            className="btn-primary !py-1.5 !px-4 !text-xs !rounded-xl"
          >
            {saving ? "저장 중..." : "발행"}
          </button>
        </div>
      </div>

      {preview ? (
        <div className="card p-8">
          <h1 className="text-3xl font-extrabold mb-4">{title || "제목 없음"}</h1>
          <p className="text-gray-400 mb-6">{excerpt}</p>
          <PostRenderer content={content} />
        </div>
      ) : (
        <>
          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="게시글 제목을 입력하세요"
            className="block w-full rounded-2xl border border-surface-border bg-surface px-5 py-3.5 text-xl font-bold text-white shadow-sm placeholder:text-gray-600 focus:border-accent-purple/50 focus:ring-2 focus:ring-accent-purple/20 focus:outline-none transition-all"
          />

          {/* Excerpt */}
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="게시글 요약 (목록에 표시됩니다)"
            rows={2}
            className="input-field resize-none"
          />

          {/* Image Gallery */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-400">
                이미지 갤러리
              </label>
              <span className="text-xs text-gray-500 font-mono">
                {images.length}/{MAX_IMAGES}
              </span>
            </div>

            {/* Image grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-5 gap-2 mb-3">
                {images.map((url) => (
                  <div
                    key={url}
                    className={`relative group cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                      coverUrl === url
                        ? "border-accent-purple shadow-glow-sm"
                        : "border-surface-border hover:border-surface-border-light"
                    }`}
                    onClick={() => setCoverUrl(url)}
                  >
                    <Image
                      src={url}
                      alt=""
                      width={200}
                      height={200}
                      className="h-20 w-full object-cover"
                    />
                    {/* Cover badge */}
                    {coverUrl === url && (
                      <div className="absolute top-1 left-1 rounded-md bg-accent-purple px-1.5 py-0.5 text-[9px] font-bold text-dark-950">
                        커버
                      </div>
                    )}
                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(url);
                      }}
                      className="absolute top-1 right-1 rounded-md bg-dark-950/80 p-0.5 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all duration-200"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload button */}
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || images.length >= MAX_IMAGES}
                className="btn-secondary !py-1.5 !px-3 !text-xs !rounded-xl disabled:opacity-40"
              >
                {uploading ? "업로드 중..." : images.length >= MAX_IMAGES ? "최대 도달" : "이미지 추가"}
              </button>
              {images.length > 0 && (
                <p className="text-[11px] text-gray-500">
                  클릭하여 커버 이미지를 선택하세요
                </p>
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-1.5">
              태그 (쉼표로 구분)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="React, Next.js, TypeScript"
              className="input-field"
            />
          </div>

          {/* Editor */}
          <TipTapEditor
            content={content}
            onChange={handleContentChange}
          />
        </>
      )}
    </div>
  );
}
