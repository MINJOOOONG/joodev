"use client";

import { type Editor } from "@tiptap/react";
import { cn } from "@/lib/utils";
import { useState, useCallback } from "react";

interface ToolbarProps {
  editor: Editor;
  onImageUpload: () => void;
  onVideoUpload: () => void;
}

const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32];
const COLORS = [
  "#e2e8f0", "#a78bfa", "#f0abfc", "#93c5fd", "#6ee7b7",
  "#fdba74", "#fca5a5", "#fbbf24", "#f472b6", "#67e8f9",
];

export default function Toolbar({ editor, onImageUpload, onVideoUpload }: ToolbarProps) {
  const [showFontSize, setShowFontSize] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [showYouTube, setShowYouTube] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [showLink, setShowLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkNewTab, setLinkNewTab] = useState(true);

  const setFontSize = useCallback(
    (size: number) => {
      editor.chain().focus().setFontSize(`${size}px`).run();
      setShowFontSize(false);
    },
    [editor]
  );

  const setColor = useCallback(
    (color: string) => {
      editor.chain().focus().setColor(color).run();
      setShowColors(false);
    },
    [editor]
  );

  const addYouTube = useCallback(() => {
    if (youtubeUrl) {
      editor.commands.setYoutubeVideo({ src: youtubeUrl });
      setYoutubeUrl("");
      setShowYouTube(false);
    }
  }, [editor, youtubeUrl]);

  const setLink = useCallback(() => {
    if (linkUrl) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl, target: linkNewTab ? "_blank" : null })
        .run();
      setLinkUrl("");
      setShowLink(false);
    } else {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setShowLink(false);
    }
  }, [editor, linkUrl, linkNewTab]);

  const ToolbarButton = ({
    onClick,
    active,
    title,
    children,
  }: {
    onClick: () => void;
    active?: boolean;
    title: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "rounded-lg p-1.5 text-sm transition-all duration-150 text-gray-400 hover:bg-surface-overlay hover:text-gray-200",
        active && "bg-accent-purple/10 text-accent-purple"
      )}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-surface-border bg-surface-raised/50 p-2.5 rounded-t-2xl">
      {/* Bold */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        title="굵게"
      >
        <strong>B</strong>
      </ToolbarButton>

      {/* Italic */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        title="기울임"
      >
        <em>I</em>
      </ToolbarButton>

      {/* Underline */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive("underline")}
        title="밑줄"
      >
        <span className="underline">U</span>
      </ToolbarButton>

      {/* Strike */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
        title="취소선"
      >
        <span className="line-through">S</span>
      </ToolbarButton>

      <div className="mx-1 h-5 w-px bg-surface-border" />

      {/* Font Size */}
      <div className="relative">
        <ToolbarButton
          onClick={() => {
            setShowFontSize(!showFontSize);
            setShowColors(false);
          }}
          title="글자 크기"
        >
          <span className="text-xs">Aa</span>
        </ToolbarButton>
        {showFontSize && (
          <div className="absolute top-full left-0 z-10 mt-1 rounded-xl border border-surface-border bg-surface-raised shadow-soft p-1">
            {FONT_SIZES.map((size) => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                className="block w-full rounded-lg px-3 py-1 text-left text-sm text-gray-300 hover:bg-surface-overlay hover:text-white transition-colors"
              >
                {size}px
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Color */}
      <div className="relative">
        <ToolbarButton
          onClick={() => {
            setShowColors(!showColors);
            setShowFontSize(false);
          }}
          title="글자 색상"
        >
          <span className="flex items-center gap-0.5">
            <span className="text-xs">A</span>
            <span
              className="h-2 w-4 rounded"
              style={{ backgroundColor: editor.getAttributes("textStyle").color || "#e2e8f0" }}
            />
          </span>
        </ToolbarButton>
        {showColors && (
          <div className="absolute top-full left-0 z-10 mt-1 rounded-xl border border-surface-border bg-surface-raised shadow-soft p-2">
            <div className="grid grid-cols-5 gap-1">
              {COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setColor(color)}
                  className="h-6 w-6 rounded border border-surface-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mx-1 h-5 w-px bg-surface-border" />

      {/* Headings */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
        title="제목 2"
      >
        H2
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
        title="제목 3"
      >
        H3
      </ToolbarButton>

      <div className="mx-1 h-5 w-px bg-surface-border" />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        title="불릿 목록"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        title="숫자 목록"
      >
        <span className="text-xs font-mono">1.</span>
      </ToolbarButton>

      <div className="mx-1 h-5 w-px bg-surface-border" />

      {/* Link */}
      <div className="relative">
        <ToolbarButton
          onClick={() => {
            setShowLink(!showLink);
            setLinkUrl(editor.getAttributes("link").href || "");
          }}
          active={editor.isActive("link")}
          title="링크"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </ToolbarButton>
        {showLink && (
          <div className="absolute top-full left-0 z-10 mt-1 rounded-xl border border-surface-border bg-surface-raised shadow-soft p-3 w-72">
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://..."
              className="input-field mb-2 !text-xs"
              onKeyDown={(e) => e.key === "Enter" && setLink()}
            />
            <label className="flex items-center gap-2 text-xs text-gray-400 mb-2">
              <input
                type="checkbox"
                checked={linkNewTab}
                onChange={(e) => setLinkNewTab(e.target.checked)}
                className="rounded border-surface-border"
              />
              새 창에서 열기
            </label>
            <div className="flex gap-2">
              <button onClick={setLink} className="btn-primary !py-1 !px-2.5 !text-xs !rounded-lg">
                적용
              </button>
              <button
                onClick={() => {
                  editor.chain().focus().unsetLink().run();
                  setShowLink(false);
                }}
                className="btn-ghost !py-1 !px-2 !text-xs"
              >
                제거
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mx-1 h-5 w-px bg-surface-border" />

      {/* Blockquote */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
        title="인용"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </ToolbarButton>

      {/* Code Block */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        active={editor.isActive("codeBlock")}
        title="코드 블록"
      >
        <span className="font-mono text-xs">&lt;/&gt;</span>
      </ToolbarButton>

      {/* Horizontal Rule */}
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="구분선"
      >
        <span className="text-xs">---</span>
      </ToolbarButton>

      <div className="mx-1 h-5 w-px bg-surface-border" />

      {/* Image */}
      <ToolbarButton onClick={onImageUpload} title="이미지 업로드">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </ToolbarButton>

      {/* Video */}
      <ToolbarButton onClick={onVideoUpload} title="영상 업로드">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </ToolbarButton>

      {/* YouTube */}
      <div className="relative">
        <ToolbarButton
          onClick={() => setShowYouTube(!showYouTube)}
          title="YouTube 임베드"
        >
          <span className="text-xs font-bold text-red-400">YT</span>
        </ToolbarButton>
        {showYouTube && (
          <div className="absolute top-full right-0 z-10 mt-1 rounded-xl border border-surface-border bg-surface-raised shadow-soft p-3 w-72">
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="YouTube URL 입력..."
              className="input-field mb-2 !text-xs"
              onKeyDown={(e) => e.key === "Enter" && addYouTube()}
            />
            <button
              onClick={addYouTube}
              className="rounded-lg bg-red-500/80 px-2.5 py-1 text-xs text-white hover:bg-red-500 transition-colors"
            >
              임베드
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
