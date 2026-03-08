"use client";

import { Node, mergeAttributes } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from "@tiptap/react";
import { useCallback, useRef, useState } from "react";

const SIZE_PRESETS = [25, 50, 75, 100] as const;

function ResizableImageView({ node, updateAttributes, selected }: NodeViewProps) {
  const [resizing, setResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const width = (node.attrs.width as number) || 100;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setResizing(true);
      startXRef.current = e.clientX;
      const container = containerRef.current?.parentElement;
      if (container) {
        startWidthRef.current = container.clientWidth * (width / 100);
      }

      const handleMouseMove = (ev: MouseEvent) => {
        const container = containerRef.current?.parentElement;
        if (!container) return;
        const parentWidth = container.clientWidth;
        const newPx = startWidthRef.current + (ev.clientX - startXRef.current);
        const newPercent = Math.max(10, Math.min(100, Math.round((newPx / parentWidth) * 100)));
        updateAttributes({ width: newPercent });
      };

      const handleMouseUp = () => {
        setResizing(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [width, updateAttributes]
  );

  return (
    <NodeViewWrapper className="my-6 flex justify-center" ref={containerRef}>
      <div
        className="relative inline-block group"
        style={{ width: `${width}%` }}
      >
        <img
          src={node.attrs.src as string}
          alt={(node.attrs.alt as string) || ""}
          className={`w-full rounded-xl ${selected ? "ring-2 ring-accent-purple" : ""}`}
          draggable={false}
        />
        {/* Size presets */}
        {selected && (
          <div className="absolute -top-9 left-1/2 -translate-x-1/2 flex gap-1 bg-surface-raised border border-surface-border rounded-lg px-1.5 py-1 shadow-soft">
            {SIZE_PRESETS.map((pct) => (
              <button
                key={pct}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  updateAttributes({ width: pct });
                }}
                className={`px-2 py-0.5 text-[11px] rounded-md transition-colors ${
                  width === pct
                    ? "bg-accent-purple text-dark-950 font-bold"
                    : "text-content-3 hover:text-heading hover:bg-surface-overlay"
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>
        )}
        {/* Resize handle */}
        <div
          onMouseDown={handleMouseDown}
          className={`absolute top-1/2 -right-3 -translate-y-1/2 w-1.5 h-10 rounded-full cursor-col-resize transition-colors ${
            resizing
              ? "bg-accent-purple"
              : "bg-content-faint opacity-0 group-hover:opacity-100 hover:bg-accent-purple"
          }`}
        />
        {/* Width indicator while resizing */}
        {resizing && (
          <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 bg-surface-raised border border-surface-border rounded-md px-2 py-0.5 text-[11px] text-accent-purple font-mono shadow-soft">
            {width}%
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}

export const ResizableImage = Node.create({
  name: "image",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      width: { default: 100 },
    };
  },

  parseHTML() {
    return [{ tag: "img[src]" }];
  },

  renderHTML({ HTMLAttributes }) {
    const { width, ...rest } = HTMLAttributes;
    return [
      "figure",
      { style: `width:${width || 100}%; margin: 1.5rem auto; display: flex; justify-content: center;` },
      ["img", mergeAttributes(rest, { class: "rounded-xl max-w-full" })],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },
});
