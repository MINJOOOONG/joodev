"use client";

import { type Editor } from "@tiptap/react";
import { cn } from "@/lib/utils";
import { useState, useCallback } from "react";
import { useToast } from "@/components/ui/toast";

interface ToolbarProps {
  editor: Editor;
  onImageUpload: () => void;
  htmlMode?: boolean;
  onToggleHtmlMode?: () => void;
}

const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32];
const LINE_HEIGHTS = [
  { value: "1.4", label: "좁게" },
  { value: "1.8", label: "기본" },
  { value: "2.2", label: "넓게" },
];
const COLORS = [
  "#e2e8f0", "#a78bfa", "#f0abfc", "#93c5fd", "#6ee7b7",
  "#fdba74", "#fca5a5", "#fbbf24", "#f472b6", "#67e8f9",
];

const CODE_LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "java", label: "Java" },
  { value: "python", label: "Python" },
  { value: "bash", label: "Bash" },
  { value: "html", label: "HTML" },
  { value: "mermaid", label: "Mermaid" },
];

function isValidYouTubeUrl(url: string): boolean {
  return /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|shorts\/)|youtu\.be\/)[\w-]+/.test(url);
}

function countYouTubeEmbeds(editor: Editor): number {
  let count = 0;
  editor.state.doc.descendants((node) => {
    if (node.type.name === "youtube") count++;
  });
  return count;
}

export default function Toolbar({ editor, onImageUpload, htmlMode, onToggleHtmlMode }: ToolbarProps) {
  const { toast } = useToast();
  const [showFontSize, setShowFontSize] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [showYouTube, setShowYouTube] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [showLink, setShowLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkNewTab, setLinkNewTab] = useState(true);
  const [showCodeLang, setShowCodeLang] = useState(false);
  const [showLineHeight, setShowLineHeight] = useState(false);

  const closeAllDropdowns = useCallback(() => {
    setShowFontSize(false);
    setShowColors(false);
    setShowYouTube(false);
    setShowLink(false);
    setShowCodeLang(false);
    setShowLineHeight(false);
  }, []);

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
    if (!youtubeUrl.trim()) return;
    if (!isValidYouTubeUrl(youtubeUrl)) {
      toast("올바른 YouTube URL을 입력해주세요.", "error");
      return;
    }
    if (countYouTubeEmbeds(editor) >= 5) {
      toast("YouTube 영상은 최대 5개까지 삽입할 수 있습니다.", "info");
      return;
    }
    editor.commands.setYoutubeVideo({ src: youtubeUrl });
    setYoutubeUrl("");
    setShowYouTube(false);
  }, [editor, youtubeUrl, toast]);

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

  const insertCodeBlock = useCallback(
    (language: string) => {
      editor
        .chain()
        .focus()
        .insertContent([
          { type: "codeBlock", attrs: { language } },
          { type: "paragraph" },
        ])
        .run();
      const pos = editor.state.selection.$from.before();
      editor.chain().setTextSelection(pos).run();
      setShowCodeLang(false);
    },
    [editor]
  );

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
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={title}
      className={cn(
        "rounded-lg p-1.5 text-sm transition-all duration-150 text-content-3 hover:bg-surface-overlay hover:text-content-1",
        active && "bg-accent-purple/10 text-accent-purple"
      )}
    >
      {children}
    </button>
  );

  return (
    <div className="sticky top-[57px] z-30 flex flex-wrap items-center gap-0.5 border-b border-surface-border bg-surface-raised/90 backdrop-blur-md p-2.5 rounded-t-2xl shadow-sm">
      {/* Bold */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        title="굵게 (Ctrl+B)"
      >
        <strong>B</strong>
      </ToolbarButton>

      {/* Italic */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        title="기울임 (Ctrl+I)"
      >
        <em className="font-serif">I</em>
      </ToolbarButton>

      {/* Underline */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive("underline")}
        title="밑줄 (Ctrl+U)"
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
            closeAllDropdowns();
            setShowFontSize((v) => !v);
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
                onMouseDown={(e) => {
                  e.preventDefault();
                  setFontSize(size);
                }}
                className="block w-full rounded-lg px-3 py-1 text-left text-sm text-content-2 hover:bg-surface-overlay hover:text-heading transition-colors"
              >
                {size}px
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Line Height */}
      <div className="relative">
        <ToolbarButton
          onClick={() => {
            closeAllDropdowns();
            setShowLineHeight((v) => !v);
          }}
          title="줄간격"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 6v12M20 6l-2 2M20 6l2 2M20 18l-2-2M20 18l2-2" />
          </svg>
        </ToolbarButton>
        {showLineHeight && (
          <div className="absolute top-full left-0 z-10 mt-1 rounded-xl border border-surface-border bg-surface-raised shadow-soft p-1 min-w-[100px]">
            {LINE_HEIGHTS.map((lh) => (
              <button
                key={lh.value}
                onMouseDown={(e) => {
                  e.preventDefault();
                  editor.chain().focus().setLineHeight(lh.value).run();
                  setShowLineHeight(false);
                }}
                className="block w-full rounded-lg px-3 py-1.5 text-left text-sm text-content-2 hover:bg-surface-overlay hover:text-heading transition-colors"
              >
                {lh.label} ({lh.value})
              </button>
            ))}
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().unsetLineHeight().run();
                setShowLineHeight(false);
              }}
              className="block w-full rounded-lg px-3 py-1.5 text-left text-sm text-content-muted hover:bg-surface-overlay hover:text-heading transition-colors border-t border-surface-border mt-1 pt-1.5"
            >
              초기화
            </button>
          </div>
        )}
      </div>

      {/* Color */}
      <div className="relative">
        <ToolbarButton
          onClick={() => {
            closeAllDropdowns();
            setShowColors((v) => !v);
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
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setColor(color);
                  }}
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
            closeAllDropdowns();
            setShowLink((v) => !v);
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
              className="input-field mb-2 text-xs"
              onKeyDown={(e) => e.key === "Enter" && setLink()}
              autoFocus
            />
            <label className="flex items-center gap-2 text-xs text-content-3 mb-2">
              <input
                type="checkbox"
                checked={linkNewTab}
                onChange={(e) => setLinkNewTab(e.target.checked)}
                className="rounded border-surface-border"
              />
              새 창에서 열기
            </label>
            <div className="flex gap-2">
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  setLink();
                }}
                className="btn-primary py-1 px-2.5 text-xs"
              >
                적용
              </button>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  editor.chain().focus().unsetLink().run();
                  setShowLink(false);
                }}
                className="btn-ghost py-1 px-2 text-xs"
              >
                제거
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mx-1 h-5 w-px bg-surface-border" />

      {/* Inline Code */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive("code")}
        title="인라인 코드 (Ctrl+E)"
      >
        <span className="font-mono text-xs px-0.5 rounded bg-accent-purple/10">{"`"}</span>
      </ToolbarButton>

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

      {/* Code Block with language selector */}
      <div className="relative">
        <ToolbarButton
          onClick={() => {
            closeAllDropdowns();
            setShowCodeLang((v) => !v);
          }}
          active={editor.isActive("codeBlock")}
          title="코드 블록"
        >
          <span className="font-mono text-xs">&lt;/&gt;</span>
        </ToolbarButton>
        {showCodeLang && (
          <div className="absolute top-full left-0 z-10 mt-1 rounded-xl border border-surface-border bg-surface-raised shadow-soft p-1 min-w-[120px]">
            {CODE_LANGUAGES.map((lang) => (
              <button
                key={lang.value}
                onMouseDown={(e) => {
                  e.preventDefault();
                  insertCodeBlock(lang.value);
                }}
                className="block w-full rounded-lg px-3 py-1.5 text-left text-sm text-content-2 hover:bg-surface-overlay hover:text-heading transition-colors"
              >
                {lang.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Horizontal Rule */}
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="구분선"
      >
        <span className="text-xs">&mdash;</span>
      </ToolbarButton>

      <div className="mx-1 h-5 w-px bg-surface-border" />

      {/* Image */}
      <ToolbarButton onClick={onImageUpload} title="이미지 업로드">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </ToolbarButton>

      {/* YouTube */}
      <div className="relative">
        <ToolbarButton
          onClick={() => {
            if (countYouTubeEmbeds(editor) >= 5) {
              toast("YouTube 영상은 최대 5개까지 삽입할 수 있습니다.", "info");
              return;
            }
            closeAllDropdowns();
            setShowYouTube((v) => !v);
          }}
          title="YouTube 임베드 (최대 5개)"
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
              className="input-field mb-2 text-xs"
              onKeyDown={(e) => e.key === "Enter" && addYouTube()}
              autoFocus
            />
            <button
              onClick={addYouTube}
              className="btn-primary py-1 px-2.5 text-xs"
            >
              임베드
            </button>
          </div>
        )}
      </div>

      {onToggleHtmlMode && (
        <>
          <div className="mx-1 h-5 w-px bg-surface-border" />
          <ToolbarButton
            onClick={onToggleHtmlMode}
            active={htmlMode}
            title="HTML 모드"
          >
            <span className="font-mono text-xs">&lt;HTML&gt;</span>
          </ToolbarButton>
        </>
      )}
    </div>
  );
}
