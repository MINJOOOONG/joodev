import { Node, mergeAttributes } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    details: {
      toggleDetails: () => ReturnType;
    };
  }
}

export const DetailsSummary = Node.create({
  name: "detailsSummary",
  content: "inline*",
  defining: true,
  selectable: false,

  parseHTML() {
    return [{ tag: "summary" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["summary", mergeAttributes(HTMLAttributes), 0];
  },
});

export const DetailsContent = Node.create({
  name: "detailsContent",
  content: "block+",
  defining: true,

  parseHTML() {
    return [{ tag: "div.details-content" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { class: "details-content" }),
      0,
    ];
  },
});

export const Details = Node.create({
  name: "details",
  group: "block",
  content: "detailsSummary detailsContent",
  defining: true,
  isolating: true,

  parseHTML() {
    return [{ tag: "details" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["details", mergeAttributes(HTMLAttributes, { open: true }), 0];
  },

  addCommands() {
    return {
      toggleDetails:
        () =>
        ({ commands, state }) => {
          const { $from } = state.selection;

          // If already inside a details node, lift out
          for (let d = $from.depth; d > 0; d--) {
            if ($from.node(d).type.name === "details") {
              // Replace the details with its content children
              return commands.lift("detailsContent");
            }
          }

          // Wrap selection in details
          return commands.insertContent({
            type: "details",
            content: [
              {
                type: "detailsSummary",
                content: [{ type: "text", text: "더보기" }],
              },
              {
                type: "detailsContent",
                content: [{ type: "paragraph" }],
              },
            ],
          });
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      Backspace: ({ editor }) => {
        const { $from, empty } = editor.state.selection;
        if (!empty) return false;

        // Check if we're at the start of a detailsSummary
        if ($from.parent.type.name === "detailsSummary" && $from.parentOffset === 0) {
          // If summary text is empty, delete the whole details block
          if ($from.parent.content.size === 0) {
            for (let d = $from.depth; d > 0; d--) {
              if ($from.node(d).type.name === "details") {
                const pos = $from.before(d);
                const node = $from.node(d);
                editor
                  .chain()
                  .focus()
                  .command(({ tr }) => {
                    tr.replaceWith(
                      pos,
                      pos + node.nodeSize,
                      editor.state.schema.nodes.paragraph.create()
                    );
                    return true;
                  })
                  .run();
                return true;
              }
            }
          }
          // Don't let backspace escape the summary
          return true;
        }

        return false;
      },
    };
  },
});
