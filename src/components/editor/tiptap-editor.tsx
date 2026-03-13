"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import LinkExt from "@tiptap/extension-link";
import { ResizableImage } from "./resizable-image";
import Youtube from "@tiptap/extension-youtube";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import java from "highlight.js/lib/languages/java";
import xml from "highlight.js/lib/languages/xml";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import bash from "highlight.js/lib/languages/bash";
import { FontSize } from "./font-size";
import { LineHeight } from "./line-height";
import Toolbar from "./toolbar";
import { useCallback, useRef, useState, useEffect } from "react";
import type { JSONContent } from "@tiptap/react";
import { useToast } from "@/components/ui/toast";

// Register languages
const lowlight = createLowlight(common);
lowlight.register("java", java);
lowlight.register("html", xml);
lowlight.register("javascript", javascript);
lowlight.register("typescript", typescript);
lowlight.register("python", python);
lowlight.register("bash", bash);

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
  const [htmlMode, setHtmlMode] = useState(false);
  const [htmlSource, setHtmlSource] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Underline,
      LinkExt.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer" },
      }),
      ResizableImage,
      Youtube.configure({
        width: 640,
        height: 360,
        nocookie: true,
      }),
      TextStyle,
      Color,
      FontSize,
      LineHeight,
      Placeholder.configure({
        placeholder: "내용을 입력하세요...",
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: "java",
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
              try {
                const data = JSON.parse(xhr.responseText);
                reject(new Error(data.error || `업로드 실패 (${xhr.status})`));
              } catch {
                reject(new Error(`업로드 실패 (${xhr.status})`));
              }
            }
          });
          xhr.addEventListener("error", () => reject(new Error("네트워크 오류가 발생했습니다.")));
          xhr.addEventListener("abort", () => reject(new Error("업로드가 취소되었습니다.")));
          xhr.open("POST", "/api/upload");
          xhr.send(formData);
        });
        return url;
      } catch (err) {
        console.error("Upload error:", err);
        toast(err instanceof Error ? err.message : "파일 업로드에 실패했습니다.", "error");
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

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !editor) return;

      const url = await uploadFile(file);
      if (url) {
        editor.chain().focus().insertContent({
          type: "image",
          attrs: { src: url, alt: file.name, width: 100 },
        }).run();
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
            editor.chain().focus().insertContent({
              type: "image",
              attrs: { src: url, alt: file.name, width: 100 },
            }).run();
          }
        }
      }
    },
    [editor, uploadFile]
  );

  // Debounced sync: HTML textarea → editor JSON → parent onChange
  useEffect(() => {
    if (!htmlMode || !editor) return;
    const timer = setTimeout(() => {
      editor.commands.setContent(htmlSource, false);
      onChange?.(editor.getJSON());
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [htmlSource, htmlMode]);

  const handleToggleHtmlMode = useCallback(() => {
    if (!editor) return;
    if (!htmlMode) {
      setHtmlSource(editor.getHTML());
      setHtmlMode(true);
    } else {
      editor.commands.setContent(htmlSource, false);
      onChange?.(editor.getJSON());
      setHtmlMode(false);
    }
  }, [editor, htmlMode, htmlSource, onChange]);

  if (!editor) {
    return (
      <div className="card overflow-hidden p-8 text-center text-content-3">
        에디터 로딩 중...
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-surface-border bg-surface text-content-1 shadow-card">
      {/* Toolbar: sticky, sits below the admin nav (h-14 = 56px + 1px border) */}
      <Toolbar
        editor={editor}
        onImageUpload={handleImageUpload}
        htmlMode={htmlMode}
        onToggleHtmlMode={handleToggleHtmlMode}
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

      {htmlMode ? (
        <div className="relative">
          <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-accent-orange/70 bg-accent-orange/10 px-2 py-0.5 rounded-md">HTML</span>
          </div>
          <textarea
            value={htmlSource}
            onChange={(e) => setHtmlSource(e.target.value)}
            className="w-full min-h-[400px] p-6 pt-10 bg-dark-975 text-content-2 font-mono text-[13px] leading-[1.7] border-0 outline-none resize-y rounded-b-2xl"
            spellCheck={false}
          />
        </div>
      ) : (
        <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
          <EditorContent editor={editor} className="tiptap" />
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
