import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import { FontSize } from "@/components/editor/font-size";
import { LineHeight } from "@/components/editor/line-height";
import { Details, DetailsSummary, DetailsContent } from "@/components/editor/details";

const ReaderImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: { default: 100 },
      caption: { default: "" },
      galleryId: { default: "" },
    };
  },
});

export const readerExtensions = [
  StarterKit.configure({ link: false, underline: false, trailingNode: false }),
  Underline,
  Link.configure({ openOnClick: true }),
  ReaderImage,
  Youtube.configure({ width: 640, height: 360, HTMLAttributes: { title: "YouTube 영상", loading: "lazy" } }),
  TextStyle,
  Color,
  FontSize,
  LineHeight,
  Details.extend({ renderHTML: ({ HTMLAttributes }) => ["details", HTMLAttributes, 0] }),
  DetailsSummary,
  DetailsContent,
];
