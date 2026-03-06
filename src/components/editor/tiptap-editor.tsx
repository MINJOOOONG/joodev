"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import LinkExt from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Placeholder from "@tiptap/extension-placeholder";
import { FontSize } from "./font-size";
import Toolbar from "./toolbar";
import { useCallback, useRef, useState } from "react";
import type { JSONContent } from "@tiptap/react";
import { useToast } from "@/components/ui/toast";

interface TipTapEditorProps {
  content?: JSONContent;
  onChange?: (json: JSONContent) => void;
}

export default function TipTapEditor({
  content,
  onChange,
}: TipTapEditorProps) {
  const { toast } = useToast();
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      LinkExt.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer" },
      }),
      Image.configure({
        allowBase64: false,
        HTMLAttributes: { class: "rounded-lg max-w-full" },
      }),
      Youtube.configure({
        width: 640,
        height: 360,
        nocookie: true,
      }),
      TextStyle,
      Color,
      FontSize,
      Placeholder.configure({
        placeholder: "내용을 입력하세요...",
      }),
    ],
    content: content || { type: "doc", content: [{ type: "paragraph" }] },
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getJSON());
    },
  });

  const uploadFile = useCallback(
    async (file: File): Promise<string | null> => {
      setUploadProgress(0);
      const formData = new FormData();
      formData.append("file", file);

      try {
        const url = await new Promise<string>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              setUploadProgress(Math.round((e.loaded / e.total) * 100));
            }
          });
          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              const data = JSON.parse(xhr.responseText);
              resolve(data.url);
            } else {
              reject(new Error("Upload failed"));
            }
          });
          xhr.addEventListener("error", () => reject(new Error("Upload failed")));
          xhr.open("POST", "/api/upload");
          xhr.send(formData);
        });
        return url;
      } catch (err) {
        console.error("Upload error:", err);
        toast("파일 업로드에 실패했습니다.", "error");
        return null;
      } finally {
        setUploadProgress(null);
      }
    },
    [toast]
  );

  const handleImageUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleVideoUpload = useCallback(() => {
    videoInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !editor) return;

      const url = await uploadFile(file);
      if (url) {
        editor.chain().focus().setImage({ src: url, alt: file.name }).run();
      }
      e.target.value = "";
    },
    [editor, uploadFile]
  );

  const handleVideoChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !editor) return;

      const url = await uploadFile(file);
      if (url) {
        editor.commands.insertContent(
          `<video src="${url}" controls class="w-full rounded-lg my-4"></video>`
        );
      }
      e.target.value = "";
    },
    [editor, uploadFile]
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      if (!editor) return;

      const files = Array.from(e.dataTransfer.files);
      for (const file of files) {
        if (file.type.startsWith("image/")) {
          const url = await uploadFile(file);
          if (url) {
            editor.chain().focus().setImage({ src: url, alt: file.name }).run();
          }
        } else if (file.type.startsWith("video/")) {
          const url = await uploadFile(file);
          if (url) {
            editor.commands.insertContent(
              `<video src="${url}" controls class="w-full rounded-lg my-4"></video>`
            );
          }
        }
      }
    },
    [editor, uploadFile]
  );

  if (!editor) {
    return (
      <div className="card overflow-hidden p-8 text-center text-gray-400">
        에디터 로딩 중...
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <Toolbar
        editor={editor}
        onImageUpload={handleImageUpload}
        onVideoUpload={handleVideoUpload}
      />

      {uploadProgress !== null && (
        <div className="px-4 py-2 bg-accent-purple/5 border-b border-surface-border">
          <div className="flex items-center gap-2 text-sm text-accent-purple">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            업로드 중... {uploadProgress}%
          </div>
          <div className="mt-1 h-1.5 w-full bg-surface-overlay rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-purple rounded-full transition-all"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
        <EditorContent editor={editor} className="tiptap" />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/mp4,video/webm"
        onChange={handleVideoChange}
        className="hidden"
      />
    </div>
  );
}
