import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import type { JSONContent } from "@tiptap/core";
import PostRenderer from "../src/components/ui/post-renderer";
import { ThemeProvider } from "../src/components/ui/theme-provider";

function render(nodes: JSONContent[]) {
  return renderToStaticMarkup(<ThemeProvider><PostRenderer content={{ type: "doc", content: nodes }} /></ThemeProvider>);
}
const text = (value: string): JSONContent => ({ type: "text", text: value });

test("article paragraphs and nested content exist in the first HTML without browser JavaScript", () => {
  const html = render([
    { type: "heading", attrs: { level: 2 }, content: [text("Server rendered heading")] },
    { type: "paragraph", content: [text("Full article body is immediately readable.")] },
    { type: "bulletList", content: [{ type: "listItem", content: [{ type: "paragraph", content: [text("Nested list item")] }] }] },
  ]);
  assert.match(html, /<h2>Server rendered heading<\/h2>/);
  assert.match(html, /<p>Full article body is immediately readable\.<\/p>/);
  assert.match(html, /<ul><li><p>Nested list item<\/p><\/li><\/ul>/);
});

test("reader preserves text marks, links, font size and line height", () => {
  const html = render([{ type: "paragraph", attrs: { lineHeight: "2" }, content: [
    { ...text("Marked text"), marks: [{ type: "bold" }, { type: "underline" }, { type: "textStyle", attrs: { color: "#ff0000", fontSize: "20px" } }] },
    { ...text("Documentation"), marks: [{ type: "link", attrs: { href: "https://example.com/docs", target: "_blank" } }] },
  ] }]);
  assert.match(html, /line-height:2/);
  assert.match(html, /<strong>/);
  assert.match(html, /<u>/);
  assert.match(html, /font-size:20px/);
  assert.match(html, /color:#ff0000/);
  assert.match(html, /href="https:\/\/example.com\/docs"/);
});

test("code is highlighted on the server and HTML-like source stays escaped", () => {
  const html = render([{ type: "codeBlock", attrs: { language: "javascript" }, content: [text('const source = "<script>alert(1)</script>";')] }]);
  assert.match(html, /data-language="javascript"/);
  assert.match(html, /hljs-keyword/);
  assert.match(html, /&lt;script&gt;/);
  assert.doesNotMatch(html, /<script>/);
});

test("image captions and adjacent galleries render in place in the first HTML", () => {
  const html = render([
    { type: "image", attrs: { src: "https://example.com/a.png", width: 50, caption: "First caption", galleryId: "gallery-1" } },
    { type: "image", attrs: { src: "https://example.com/b.png", width: 50, caption: "Second caption", galleryId: "gallery-1" } },
    { type: "paragraph", content: [text("After the gallery")] },
  ]);
  assert.match(html, /class="image-gallery-row" data-count="2"/);
  assert.match(html, /<figcaption class="image-caption">First caption<\/figcaption>/);
  assert.ok(html.indexOf("Second caption") < html.indexOf("After the gallery"));
  assert.match(html, /loading="lazy"/);
});

test("YouTube iframe and collapsed details work without the editor runtime", () => {
  const html = render([
    { type: "youtube", attrs: { src: "https://www.youtube.com/watch?v=dQw4w9WgXc", width: 640, height: 360 } },
    { type: "details", content: [
      { type: "detailsSummary", content: [text("Read more")] },
      { type: "detailsContent", content: [{ type: "paragraph", content: [text("Disclosure content")] }] },
    ] },
  ]);
  assert.match(html, /<iframe/);
  assert.match(html, /youtube.com\/embed\/dQw4w9WgXc/);
  assert.match(html, /<details><summary>Read more<\/summary>/);
  assert.match(html, /Disclosure content/);
  assert.doesNotMatch(html, /<details open/);
});

test("Mermaid code is readable before hydration and retains interactive view buttons", () => {
  const html = render([{ type: "codeBlock", attrs: { language: "mermaid" }, content: [text("graph TD; A-->B;")] }]);
  assert.match(html, /graph TD; A--&gt;B;/);
  assert.match(html, /Diagram/);
  assert.match(html, /Both/);
  assert.doesNotMatch(html, /mermaid-placeholder/);
});

test("legacy nodes and marks retain their text instead of blanking the article", () => {
  const html = render([{ type: "legacyBlock", content: [{ ...text("Older article content"), marks: [{ type: "legacyMark" }] }] }]);
  assert.match(html, /Older article content/);
});
