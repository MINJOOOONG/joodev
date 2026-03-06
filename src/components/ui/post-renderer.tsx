"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import { useEffect } from "react";
import type { JSONContent } from "@tiptap/react";

interface PostRendererProps {
  content: JSONContent;
}

export default function PostRenderer({ content }: PostRendererProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: true }),
      Image,
      Youtube.configure({ width: 640, height: 360 }),
      TextStyle,
      Color,
    ],
    content,
    editable: false,
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && content) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  return (
    <div className="tiptap article-content max-w-none">
      <EditorContent editor={editor} />
    </div>
  );
}
