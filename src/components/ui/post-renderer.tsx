import { Fragment, type ReactNode } from "react";
import { renderToReactElement } from "@tiptap/static-renderer/pm/react";
import { getEmbedUrlFromYoutubeUrl } from "@tiptap/extension-youtube";
import type { JSONContent } from "@tiptap/core";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { common, createLowlight } from "lowlight";
import type { RootContent } from "hast";
import { readerExtensions } from "@/lib/reader-extensions";
import MermaidBlock from "./mermaid-block";

const lowlight = createLowlight(common);

function highlightedNodes(nodes: RootContent[]): ReactNode[] {
  return nodes.map((node, index) => node.type === "text" ? node.value : node.type === "element" ? (
    <span key={index} className={(node.properties.className as string[] | undefined)?.join(" ")}>
      {highlightedNodes(node.children)}
    </span>
  ) : null);
}

type RenderElement = (props: { content: ProseMirrorNode; parent?: ProseMirrorNode }) => ReactNode;

// Keep adjacent gallery images in document order, without moving DOM nodes after hydration.
function renderBlocks(node: ProseMirrorNode, renderElement: RenderElement) {
  const result: ReactNode[] = [];
  let group: ProseMirrorNode[] = [];
  let galleryId = "";
  function flush() {
    if (!group.length) return;
    const images = group.map((child, index) => <Fragment key={index}>{renderElement({ content: child, parent: node })}</Fragment>);
    result.push(group.length > 1
      ? <div key={result.length} className="image-gallery-row" data-count={group.length}>{images}</div>
      : <Fragment key={result.length}>{images}</Fragment>);
    group = [];
  }
  node.forEach((child) => {
    const id = child.type.name === "image" && typeof child.attrs.galleryId === "string" ? child.attrs.galleryId : "";
    if (id) {
      if (id !== galleryId || group.length === 3) flush();
      galleryId = id;
      group.push(child);
    } else {
      flush();
      galleryId = "";
      result.push(<Fragment key={result.length}>{renderElement({ content: child, parent: node })}</Fragment>);
    }
  });
  flush();
  return result;
}

export default function PostRenderer({ content }: { content: JSONContent }) {
  const document = content?.type === "doc" ? content : { type: "doc", content: [] };
  return (
    <div className="tiptap article-content max-w-none">
      {renderToReactElement({
        extensions: readerExtensions,
        content: document,
        options: {
          nodeMapping: {
            doc: ({ node, renderElement }) => <>{renderBlocks(node, renderElement)}</>,
            blockquote: ({ node, renderElement }) => <blockquote>{renderBlocks(node, renderElement)}</blockquote>,
            listItem: ({ node, renderElement }) => <li>{renderBlocks(node, renderElement)}</li>,
            detailsContent: ({ node, renderElement }) => <div className="details-content">{renderBlocks(node, renderElement)}</div>,
            youtube: ({ node }) => {
              const src = getEmbedUrlFromYoutubeUrl({ url: node.attrs.src || "", controls: true, startAt: node.attrs.start || 0 });
              if (!src) return null;
              return <div data-youtube-video=""><iframe src={src} title="YouTube 영상" width={640} height={360} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /></div>;
            },
            image: ({ node }) => {
              const { src, alt, title, caption, galleryId } = node.attrs;
              if (typeof src !== "string" || !src) return null;
              const width = Math.max(10, Math.min(100, Number(node.attrs.width) || 100));
              return (
                <figure data-gallery-id={galleryId || undefined} style={{ width: `${width}%`, margin: "1.5rem auto", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  {/* Body images keep the author's aspect ratio and captions. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={typeof alt === "string" ? alt : ""} title={typeof title === "string" ? title : undefined} loading="lazy" decoding="async" className="rounded-2xl max-w-full shadow-soft" />
                  {caption && <figcaption className="image-caption">{String(caption)}</figcaption>}
                </figure>
              );
            },
            codeBlock: ({ node }) => {
              const code = node.textContent;
              const language = typeof node.attrs.language === "string" ? node.attrs.language : "";
              if (language === "mermaid" && code.trim()) return <MermaidBlock code={code} />;
              return <pre data-language={language || "code"}><code className={language ? `language-${language}` : undefined}>
                {language && lowlight.registered(language) ? highlightedNodes(lowlight.highlight(language, code).children) : code}
              </code></pre>;
            },
          },
          // Older content can include extensions no longer present in the editor.
          // Preserve their text rather than making the whole article fail to render.
          unhandledNode: ({ children }) => <>{children}</>,
          unhandledMark: ({ children }) => <>{children}</>,
        },
      })}
    </div>
  );
}
