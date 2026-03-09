"use client";

import { Node, mergeAttributes } from "@tiptap/core";
import {
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type NodeViewProps,
} from "@tiptap/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Fragment, Slice } from "@tiptap/pm/model";

const SIZE_PRESETS = [25, 50, 75, 100] as const;

/* ── module-level drag state ── */
let dragSourcePos: number | null = null;
let dragSourceGalleryId: string | null = null;

function ResizableImageView({
  node,
  updateAttributes,
  selected,
  editor,
  getPos,
}: NodeViewProps) {
  const [resizing, setResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const [dropIndicator, setDropIndicator] = useState<"left" | "right" | null>(
    null
  );

  const width = (node.attrs.width as number) || 100;
  const caption = (node.attrs.caption as string) || "";
  const galleryId = (node.attrs.galleryId as string) || "";

  // Count how many images share this galleryId
  const galleryInfo = useMemo(() => {
    if (!galleryId || !editor) return { size: 1, index: 0 };
    let count = 0;
    let myIndex = 0;
    let foundMe = false;
    editor.state.doc.descendants((n) => {
      if (n.type.name === "image" && n.attrs.galleryId === galleryId) {
        if (n === node) {
          myIndex = count;
          foundMe = true;
        }
        count++;
      }
    });
    if (!foundMe) {
      count = 0;
      editor.state.doc.descendants((n) => {
        if (n.type.name === "image" && n.attrs.galleryId === galleryId) {
          if (n.attrs.src === node.attrs.src) myIndex = count;
          count++;
        }
      });
    }
    return { size: Math.min(count, 3), index: myIndex };
  }, [galleryId, editor, node]);

  const isInGallery = galleryId && galleryInfo.size >= 2;
  const galleryWidthPct =
    galleryInfo.size === 2
      ? "calc(50% - 0.375rem)"
      : galleryInfo.size === 3
        ? "calc(33.333% - 0.5rem)"
        : "100%";

  /* ── Resize ── */
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
        const newPercent = Math.max(
          10,
          Math.min(100, Math.round((newPx / parentWidth) * 100))
        );
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

  /* ── Drag & Drop for gallery grouping ── */
  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      const pos = typeof getPos === "function" ? getPos() : -1;
      dragSourcePos = pos;
      dragSourceGalleryId = galleryId || null;
      e.dataTransfer.setData("application/x-image-gallery", String(pos));
      e.dataTransfer.effectAllowed = "move";
    },
    [getPos, galleryId]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      // Only respond to image gallery drags
      if (!e.dataTransfer.types.includes("application/x-image-gallery"))
        return;

      const myPos = typeof getPos === "function" ? getPos() : -1;
      if (myPos === dragSourcePos) return; // can't drop on self

      e.preventDefault();
      e.stopPropagation();

      // Determine left or right based on cursor
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const midX = rect.left + rect.width / 2;
      setDropIndicator(e.clientX < midX ? "left" : "right");
    },
    [getPos]
  );

  const handleDragLeave = useCallback(() => {
    setDropIndicator(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDropIndicator(null);

      if (!editor || dragSourcePos === null || dragSourcePos < 0) return;

      const myPos = typeof getPos === "function" ? getPos() : -1;
      if (myPos < 0 || myPos === dragSourcePos) return;

      const sourceNode = editor.state.doc.nodeAt(dragSourcePos);
      if (!sourceNode || sourceNode.type.name !== "image") return;

      // Check gallery size limit (max 3)
      const targetGalleryId = galleryId;
      let currentGallerySize = 1; // the target itself
      if (targetGalleryId) {
        currentGallerySize = 0;
        editor.state.doc.descendants((n) => {
          if (
            n.type.name === "image" &&
            n.attrs.galleryId === targetGalleryId
          ) {
            currentGallerySize++;
          }
        });
      }
      if (currentGallerySize >= 3) return;

      const newGalleryId = targetGalleryId || `gallery-${Date.now()}`;
      const side = e.clientX < (e.currentTarget as HTMLElement).getBoundingClientRect().left + (e.currentTarget as HTMLElement).getBoundingClientRect().width / 2 ? "left" : "right";

      const { tr } = editor.state;

      // 1. Set galleryId on target
      tr.setNodeMarkup(myPos, undefined, {
        ...node.attrs,
        galleryId: newGalleryId,
      });

      // 2. Delete source from original position
      tr.delete(
        tr.mapping.map(dragSourcePos),
        tr.mapping.map(dragSourcePos + sourceNode.nodeSize)
      );

      // 3. Insert source next to target
      const mappedTargetPos = tr.mapping.map(myPos);
      const targetInDoc = tr.doc.nodeAt(mappedTargetPos);
      const targetSize = targetInDoc ? targetInDoc.nodeSize : 1;

      const insertPos =
        side === "right"
          ? mappedTargetPos + targetSize
          : mappedTargetPos;

      const newImageNode = editor.state.schema.nodes.image.create({
        ...sourceNode.attrs,
        galleryId: newGalleryId,
      });
      tr.insert(insertPos, newImageNode);

      editor.view.dispatch(tr);

      dragSourcePos = null;
      dragSourceGalleryId = null;
    },
    [editor, node, getPos, galleryId]
  );

  const handleDragEnd = useCallback(() => {
    dragSourcePos = null;
    dragSourceGalleryId = null;
    setDropIndicator(null);
  }, []);

  // Clear drop indicator when dragging ends globally
  useEffect(() => {
    const clear = () => setDropIndicator(null);
    document.addEventListener("dragend", clear);
    return () => document.removeEventListener("dragend", clear);
  }, []);

  return (
    <NodeViewWrapper
      className={
        isInGallery
          ? "inline-block align-top"
          : "my-6 flex flex-col items-center"
      }
      style={
        isInGallery
          ? {
              width: galleryWidthPct,
              padding: "0.5rem 0.375rem",
              boxSizing: "border-box" as const,
            }
          : {}
      }
      ref={containerRef}
    >
      <div
        className="relative inline-block group w-full"
        style={isInGallery ? {} : { width: `${width}%`, margin: "0 auto" }}
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onDragEnd={handleDragEnd}
      >
        {/* Left drop indicator */}
        {dropIndicator === "left" && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-purple rounded-full z-10 pointer-events-none" />
        )}
        {/* Right drop indicator */}
        {dropIndicator === "right" && (
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-accent-purple rounded-full z-10 pointer-events-none" />
        )}

        <img
          src={node.attrs.src as string}
          alt={(node.attrs.alt as string) || ""}
          className={`w-full rounded-xl ${selected ? "ring-2 ring-accent-purple" : ""} ${dropIndicator ? "opacity-70" : ""}`}
          style={isInGallery ? { height: "180px", objectFit: "cover" } : {}}
          draggable={false}
        />
        {/* Toolbar when selected */}
        {selected && (
          <div className="absolute -top-9 left-1/2 -translate-x-1/2 flex gap-1 bg-surface-raised border border-surface-border rounded-lg px-1.5 py-1 shadow-soft whitespace-nowrap">
            {/* Size presets (only when NOT in gallery) */}
            {!isInGallery &&
              SIZE_PRESETS.map((pct) => (
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
        {/* Resize handle (only when NOT in gallery) */}
        {!isInGallery && (
          <div
            onMouseDown={handleMouseDown}
            className={`absolute top-1/2 -right-3 -translate-y-1/2 w-1.5 h-10 rounded-full cursor-col-resize transition-colors ${
              resizing
                ? "bg-accent-purple"
                : "bg-content-faint opacity-0 group-hover:opacity-100 hover:bg-accent-purple"
            }`}
          />
        )}
        {/* Width indicator while resizing */}
        {resizing && (
          <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 bg-surface-raised border border-surface-border rounded-md px-2 py-0.5 text-[11px] text-accent-purple font-mono shadow-soft">
            {width}%
          </div>
        )}
      </div>
      {/* Caption input */}
      <input
        type="text"
        value={caption}
        onChange={(e) => updateAttributes({ caption: e.target.value })}
        placeholder="캡션을 입력하세요..."
        className="mt-2 w-full text-center text-[13px] text-content-muted bg-transparent border-0 outline-none placeholder:text-content-faint focus:text-content-2 transition-colors"
      />
      {/* Gallery indicator */}
      {isInGallery && (
        <div className="mt-1 text-center">
          <span className="text-[10px] text-accent-purple/50 font-medium">
            {galleryInfo.size}장 묶음 · 드래그하여 분리
          </span>
        </div>
      )}
    </NodeViewWrapper>
  );
}

/* ── Gallery cleanup plugin ── */
const galleryCleanupPluginKey = new PluginKey("galleryCleanup");

function createGalleryCleanupPlugin() {
  return new Plugin({
    key: galleryCleanupPluginKey,

    appendTransaction(_transactions, _oldState, newState) {
      // Collect all images with galleryId, tracking document order
      const galleries = new Map<
        string,
        { pos: number; blockIndex: number }[]
      >();
      let blockIndex = 0;
      newState.doc.forEach((node, pos) => {
        if (node.type.name === "image" && node.attrs.galleryId) {
          const gid = node.attrs.galleryId as string;
          const arr = galleries.get(gid);
          if (arr) {
            arr.push({ pos, blockIndex });
          } else {
            galleries.set(gid, [{ pos, blockIndex }]);
          }
        }
        blockIndex++;
      });

      let needsFix = false;
      const toRemove: number[] = [];

      galleries.forEach((members) => {
        if (members.length === 1) {
          // Single member → remove galleryId
          toRemove.push(members[0].pos);
          needsFix = true;
          return;
        }

        // Check consecutiveness
        members.sort((a, b) => a.blockIndex - b.blockIndex);

        // Split into consecutive groups
        const groups: (typeof members)[] = [];
        let current = [members[0]];
        for (let i = 1; i < members.length; i++) {
          if (members[i].blockIndex === members[i - 1].blockIndex + 1) {
            current.push(members[i]);
          } else {
            groups.push(current);
            current = [members[i]];
          }
        }
        groups.push(current);

        // Remove galleryId from groups with only 1 member
        for (const g of groups) {
          if (g.length < 2) {
            for (const m of g) {
              toRemove.push(m.pos);
              needsFix = true;
            }
          }
        }
      });

      if (!needsFix) return null;

      const tr = newState.tr;
      for (const pos of toRemove) {
        const node = newState.doc.nodeAt(pos);
        if (node) {
          tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            galleryId: "",
          });
        }
      }

      return tr;
    },

    props: {
      // When ProseMirror handles a normal drop (not intercepted by drop zones),
      // clear galleryId from the dropped image
      handleDrop(view, event, slice, moved) {
        if (!moved || !slice) return false;

        // Check if the dropped content is an image with galleryId
        if (
          slice.content.childCount === 1 &&
          slice.content.firstChild?.type.name === "image" &&
          slice.content.firstChild.attrs.galleryId
        ) {
          // Create a new slice with galleryId cleared
          const oldNode = slice.content.firstChild;
          const newNode = oldNode.type.create(
            { ...oldNode.attrs, galleryId: "" },
            oldNode.content,
            oldNode.marks
          );
          const newSlice = new Slice(
            Fragment.from(newNode),
            slice.openStart,
            slice.openEnd
          );

          // Get drop position
          const dropPos = view.posAtCoords({
            left: event.clientX,
            top: event.clientY,
          });
          if (!dropPos) return false;

          const tr = view.state.tr;

          // Delete from original position (dragging state in view)
          const dragging = (view as unknown as { dragging?: { move: boolean } }).dragging;
          if (dragging?.move) {
            tr.deleteSelection();
          }

          // Insert at drop position
          const mappedPos = tr.mapping.map(dropPos.pos);
          const $pos = tr.doc.resolve(mappedPos);
          // Find the best position to insert
          const insertPos = $pos.before($pos.depth);
          tr.insert(insertPos, newNode);

          view.dispatch(tr);
          view.focus();
          return true;
        }

        return false;
      },
    },
  });
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
      caption: { default: "" },
      galleryId: { default: "" },
    };
  },

  parseHTML() {
    return [
      {
        tag: "figure",
        getAttrs(dom) {
          const img = (dom as HTMLElement).querySelector("img");
          if (!img) return false;
          const figcaption = (dom as HTMLElement).querySelector("figcaption");
          const style = (dom as HTMLElement).getAttribute("style") || "";
          const widthMatch = style.match(/width:\s*(\d+)%/);
          return {
            src: img.getAttribute("src"),
            alt: img.getAttribute("alt"),
            title: img.getAttribute("title"),
            width: widthMatch ? parseInt(widthMatch[1]) : 100,
            caption: figcaption?.textContent || "",
            galleryId:
              (dom as HTMLElement).getAttribute("data-gallery-id") || "",
          };
        },
      },
      {
        tag: "img[src]",
        getAttrs(dom) {
          return {
            src: (dom as HTMLElement).getAttribute("src"),
            alt: (dom as HTMLElement).getAttribute("alt"),
            title: (dom as HTMLElement).getAttribute("title"),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { width, caption, galleryId, ...rest } = HTMLAttributes;
    const children: unknown[] = [
      ["img", mergeAttributes(rest, { class: "rounded-xl max-w-full" })],
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

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },

  addProseMirrorPlugins() {
    return [createGalleryCleanupPlugin()];
  },
});
