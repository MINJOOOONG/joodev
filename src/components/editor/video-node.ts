import { Node, mergeAttributes } from "@tiptap/core";

export const VideoNode = Node.create({
  name: "video",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      controls: { default: true },
    };
  },

  parseHTML() {
    return [
      {
        tag: "video[src]",
        getAttrs(dom) {
          return {
            src: (dom as HTMLElement).getAttribute("src"),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "video",
      mergeAttributes(HTMLAttributes, {
        controls: "true",
        class: "w-full rounded-xl my-6",
      }),
    ];
  },
});
