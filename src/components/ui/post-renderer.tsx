"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { VideoNode } from "@/components/editor/video-node";

const ResizableImageRenderer = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: { default: 100 },
      caption: { default: "" },
      galleryId: { default: "" },
    };
  },
  renderHTML({ HTMLAttributes }) {
    const { width, caption, galleryId, ...rest } = HTMLAttributes;
    const children: unknown[] = [
      ["img", { ...rest, class: "rounded-2xl max-w-full shadow-soft" }],
    ];
    if (caption) {
      children.push(["figcaption", { class: "image-caption" }, caption]);
    }
    return [
      "figure",
      {
        style: `width:${width || 100}%; margin: 1.5rem auto; display: flex; flex-direction: column; align-items: center;`,
        ...(galleryId ? { "data-gallery-id": galleryId } : {}),
      },
      ...children,
    ];
  },
});
import Youtube from "@tiptap/extension-youtube";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import { FontSize } from "@/components/editor/font-size";
import { LineHeight } from "@/components/editor/line-height";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import java from "highlight.js/lib/languages/java";
import xml from "highlight.js/lib/languages/xml";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import bash from "highlight.js/lib/languages/bash";
import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
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

/* ─── Mermaid Block (original UI: Diagram / Code / Both) ─── */
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

/* ─── PostRenderer ─── */
interface PostRendererProps {
  content: JSONContent;
}

export default function PostRenderer({ content }: PostRendererProps) {
  const { theme } = useTheme();
  const [mermaidBlocks, setMermaidBlocks] = useState<{ index: number; code: string }[]>([]);
  const [mountPoints, setMountPoints] = useState<HTMLElement[]>([]);
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
      VideoNode,
      Youtube.configure({ width: 640, height: 360 }),
      TextStyle,
      Color,
      FontSize,
      LineHeight,
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

  // Find placeholder paragraphs and replace them with mount-point divs for portals
  useEffect(() => {
    if (!containerRef.current || mermaidBlocks.length === 0) return;

    const timer = setTimeout(() => {
      const container = containerRef.current;
      if (!container) return;

      const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
      const found: { node: Text; idx: number }[] = [];
      let textNode: Text | null;
      while ((textNode = walker.nextNode() as Text | null)) {
        const match = textNode.textContent?.match(/%%mermaid-placeholder-(\d+)%%/);
        if (match) {
          found.push({ node: textNode, idx: parseInt(match[1]) });
        }
      }

      // Sort by index to ensure correct order
      found.sort((a, b) => a.idx - b.idx);

      const points: HTMLElement[] = [];
      for (const { node, idx } of found) {
        const p = node.parentElement;
        if (!p) continue;

        // Create a mount-point div and replace the placeholder paragraph
        const mountDiv = document.createElement("div");
        mountDiv.setAttribute("data-mermaid-mount", String(idx));
        p.parentNode?.replaceChild(mountDiv, p);
        points[idx] = mountDiv;
      }

      setMountPoints([...points]);
    }, 150);

    return () => clearTimeout(timer);
  }, [editor, content, mermaidBlocks]);

  // Group figures with matching data-gallery-id into gallery rows
  useEffect(() => {
    if (!containerRef.current) return;

    const timer = setTimeout(() => {
      const container = containerRef.current;
      if (!container) return;

      const editorEl = container.querySelector(".tiptap");
      if (!editorEl) return;

      // Collect all figures with gallery IDs
      const figures = Array.from(editorEl.querySelectorAll("figure[data-gallery-id]")) as HTMLElement[];
      const groups = new Map<string, HTMLElement[]>();

      for (const fig of figures) {
        const gid = fig.getAttribute("data-gallery-id");
        if (!gid) continue;
        if (!groups.has(gid)) groups.set(gid, []);
        groups.get(gid)!.push(fig);
      }

      // Wrap each group in a gallery row
      groups.forEach((figs) => {
        if (figs.length < 2) return;
        // Check if already wrapped
        if (figs[0].parentElement?.classList.contains("image-gallery-row")) return;

        const wrapper = document.createElement("div");
        wrapper.className = "image-gallery-row";
        wrapper.setAttribute("data-count", String(figs.length));
        figs[0].parentNode?.insertBefore(wrapper, figs[0]);
        for (const fig of figs) {
          wrapper.appendChild(fig);
        }
      });
    }, 200);

    return () => clearTimeout(timer);
  }, [editor, content, mermaidBlocks]);

  return (
    <div ref={containerRef} className="tiptap article-content max-w-none">
      <EditorContent editor={editor} />
      {/* Portal each MermaidBlock into its mount-point div at the original position */}
      {mermaidBlocks.map((block, i) =>
        mountPoints[i]
          ? createPortal(
              <MermaidBlock key={`${i}-${theme}`} code={block.code} theme={theme} />,
              mountPoints[i]
            )
          : null
      )}
    </div>
  );
}
