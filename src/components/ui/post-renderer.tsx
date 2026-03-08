"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";

const ResizableImageRenderer = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: { default: 100 },
    };
  },
  renderHTML({ HTMLAttributes }) {
    const { width, ...rest } = HTMLAttributes;
    return [
      "figure",
      { style: `width:${width || 100}%; margin: 1.5rem auto; display: flex; justify-content: center;` },
      ["img", { ...rest, class: "rounded-2xl max-w-full shadow-soft" }],
    ];
  },
});
import Youtube from "@tiptap/extension-youtube";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import java from "highlight.js/lib/languages/java";
import xml from "highlight.js/lib/languages/xml";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import bash from "highlight.js/lib/languages/bash";
import { useEffect, useRef, useState, useCallback } from "react";
import type { JSONContent } from "@tiptap/react";
import mermaid from "mermaid";
import { useTheme } from "./theme-provider";

const lowlight = createLowlight(common);
lowlight.register("java", java);
lowlight.register("html", xml);
lowlight.register("javascript", javascript);
lowlight.register("typescript", typescript);
lowlight.register("python", python);
lowlight.register("bash", bash);

type MermaidViewMode = "diagram" | "code" | "both";

function MermaidBlock({ code, theme }: { code: string; theme: string }) {
  const [svgHtml, setSvgHtml] = useState<string>("");
  const [viewMode, setViewMode] = useState<MermaidViewMode>("diagram");
  const [error, setError] = useState(false);

  const renderMermaid = useCallback(async () => {
    const isDark = theme === "dark";
    mermaid.initialize({
      startOnLoad: false,
      theme: isDark ? "dark" : "default",
      themeVariables: isDark
        ? {
            darkMode: true,
            background: "#0d0919",
            primaryColor: "#a78bfa",
            primaryTextColor: "#e2e8f0",
            primaryBorderColor: "#a78bfa",
            lineColor: "#6b7280",
            secondaryColor: "#f0abfc",
            tertiaryColor: "#1e1b4b",
            fontFamily: "JetBrains Mono, monospace",
          }
        : {
            darkMode: false,
            background: "#f8fafc",
            primaryColor: "#7c3aed",
            primaryTextColor: "#1f2937",
            primaryBorderColor: "#7c3aed",
            lineColor: "#9ca3af",
            secondaryColor: "#db2777",
            tertiaryColor: "#ede9fe",
            fontFamily: "JetBrains Mono, monospace",
          },
    });

    try {
      const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
      const { svg } = await mermaid.render(id, code.trim());
      setSvgHtml(svg);
      setError(false);
    } catch {
      setError(true);
    }
  }, [code, theme]);

  useEffect(() => {
    renderMermaid();
  }, [renderMermaid]);

  const tabs: { mode: MermaidViewMode; label: string }[] = [
    { mode: "diagram", label: "Diagram" },
    { mode: "code", label: "Code" },
    { mode: "both", label: "Both" },
  ];

  return (
    <div className="my-8 rounded-2xl border border-surface-border overflow-hidden" style={{ backgroundColor: "rgb(var(--color-bg-code-article))" }}>
      {/* Tab bar */}
      <div className="flex items-center gap-1 px-4 pt-3 pb-2">
        <span className="mr-2 text-[10px] font-semibold uppercase tracking-wider text-accent-purple/60">Mermaid</span>
        {tabs.map((tab) => (
          <button
            key={tab.mode}
            onClick={() => setViewMode(tab.mode)}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all duration-200 ${
              viewMode === tab.mode
                ? "bg-accent-purple/15 text-accent-purple"
                : "text-content-muted hover:text-content-2 hover:bg-surface-overlay/50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {(viewMode === "code" || viewMode === "both") && (
        <div>
          <pre className="!my-0 !rounded-none !border-0 text-[13px] leading-[1.7]">
            <code className="language-mermaid">{code}</code>
          </pre>
        </div>
      )}

      {(viewMode === "diagram" || viewMode === "both") && !error && svgHtml && (
        <div
          className={`flex justify-center p-6 overflow-x-auto${viewMode === "both" ? " border-t border-surface-border/50" : ""}`}
          dangerouslySetInnerHTML={{ __html: svgHtml }}
        />
      )}

      {error && (
        <div className="p-6 text-center text-sm text-content-muted">
          Mermaid 렌더링 실패 — 코드를 확인해주세요.
        </div>
      )}
    </div>
  );
}

interface PostRendererProps {
  content: JSONContent;
}

export default function PostRenderer({ content }: PostRendererProps) {
  const { theme } = useTheme();
  const [mermaidBlocks, setMermaidBlocks] = useState<{ index: number; code: string }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Extract mermaid blocks from content
  useEffect(() => {
    const blocks: { index: number; code: string }[] = [];
    let idx = 0;
    function walk(node: JSONContent) {
      if (node.type === "codeBlock" && node.attrs?.language === "mermaid") {
        const code = node.content?.map((c) => c.text || "").join("") || "";
        if (code.trim()) {
          blocks.push({ index: idx, code });
        }
        idx++;
      }
      if (node.content) {
        for (const child of node.content) {
          walk(child);
        }
      }
    }
    walk(content);
    setMermaidBlocks(blocks);
  }, [content]);

  // Build modified content: replace mermaid code blocks with placeholder paragraphs
  const modifiedContent: JSONContent = (() => {
    if (mermaidBlocks.length === 0) return content;

    let mermaidIdx = 0;
    function transformNode(node: JSONContent): JSONContent {
      if (node.type === "codeBlock" && node.attrs?.language === "mermaid") {
        const code = node.content?.map((c) => c.text || "").join("") || "";
        if (code.trim()) {
          mermaidIdx++;
          // Replace with an empty paragraph as a placeholder — MermaidBlock renders separately
          return { type: "paragraph", content: [{ type: "text", text: `%%mermaid-placeholder-${mermaidIdx - 1}%%` }] };
        }
      }
      if (node.content) {
        return { ...node, content: node.content.map(transformNode) };
      }
      return node;
    }
    return transformNode(content);
  })();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Underline,
      Link.configure({ openOnClick: true }),
      ResizableImageRenderer,
      Youtube.configure({ width: 640, height: 360 }),
      TextStyle,
      Color,
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: modifiedContent,
    editable: false,
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor) {
      editor.commands.setContent(modifiedContent);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, content]);

  // Replace placeholder text with mermaid mount points after render
  useEffect(() => {
    if (!containerRef.current || mermaidBlocks.length === 0) return;

    const timer = setTimeout(() => {
      const container = containerRef.current;
      if (!container) return;

      // Find placeholder paragraphs and hide them
      const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
      const placeholders: { node: Text; idx: number }[] = [];
      let textNode: Text | null;
      while ((textNode = walker.nextNode() as Text | null)) {
        const match = textNode.textContent?.match(/%%mermaid-placeholder-(\d+)%%/);
        if (match) {
          placeholders.push({ node: textNode, idx: parseInt(match[1]) });
        }
      }

      for (const { node } of placeholders) {
        const p = node.parentElement;
        if (p) {
          p.style.display = "none";
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [editor, content, mermaidBlocks]);

  return (
    <div ref={containerRef} className="tiptap article-content max-w-none">
      <EditorContent editor={editor} />
      {/* Render mermaid blocks as React components at the end (they appear via CSS order or we accept bottom placement) */}
      {mermaidBlocks.map((block, i) => (
        <MermaidBlock key={`${i}-${theme}`} code={block.code} theme={theme} />
      ))}
    </div>
  );
}
