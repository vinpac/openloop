import {
  EditorContent,
  EditorContentProps,
  EditorRoot,
  JSONContent,
  Placeholder,
  StarterKit,
  TaskItem,
  TaskList,
} from "novel";
import { useCallback, useMemo, useState } from "react";
import { cx } from "class-variance-authority";
import { generateJSON } from "@tiptap/html";
import { Editor as EditorType } from "@tiptap/core";

const starterKit = StarterKit.configure({
  bulletList: {
    HTMLAttributes: {
      class: cx("list-disc list-outside leading-3 -mt-2"),
    },
  },
  orderedList: {
    HTMLAttributes: {
      class: cx("list-decimal list-outside leading-3 -mt-2"),
    },
  },
  listItem: {
    HTMLAttributes: {
      class: cx("leading-normal -mb-2"),
    },
  },
  blockquote: {
    HTMLAttributes: {
      class: cx("border-l-4 border-primary"),
    },
  },
  codeBlock: {
    HTMLAttributes: {
      class: cx("rounded-sm bg-muted border p-5 font-mono font-medium"),
    },
  },
  code: {
    HTMLAttributes: {
      class: cx("rounded-md bg-muted  px-1.5 py-1 font-mono font-medium"),
      spellcheck: "false",
    },
  },
  horizontalRule: false,
  dropcursor: {
    color: "#DBEAFE",
    width: 4,
  },
  gapcursor: false,
});

const taskList = TaskList.configure({
  HTMLAttributes: {
    class: cx("not-prose pl-2"),
  },
});
const taskItem = TaskItem.configure({
  HTMLAttributes: {
    class: cx("flex items-start my-4"),
  },
  nested: true,
});

const EXTENSIONS = [starterKit, taskList, taskItem];

type Props = {
  className?: string;
  defaultContent?: string | JSONContent;
  placeholder?: string;
  disabled?: boolean;
  onUpdate?: (json: JSONContent, editor: EditorType) => void;
};

const RichTextEditor = ({
  className,
  defaultContent,
  placeholder = "Write something...",
  disabled,
  onUpdate,
}: Props) => {
  const ext = useMemo(() => {
    return [
      ...EXTENSIONS,
      Placeholder.configure({
        placeholder,
      }),
    ];
  }, [placeholder]);
  const [content, setContent] = useState<JSONContent | undefined>(() =>
    typeof defaultContent === "string"
      ? generateJSON(defaultContent, ext)
      : defaultContent
  );

  const handleUpdate = useCallback<NonNullable<EditorContentProps["onUpdate"]>>(
    ({ editor }) => {
      if (disabled) {
        return;
      }

      onUpdate?.(editor.getJSON(), editor);
      setContent(editor.getJSON());
    },
    [disabled, onUpdate]
  );

  return (
    <div className={className}>
      <EditorRoot>
        <EditorContent
          className="prose [&_div[contenteditable=true]]:outline-none"
          initialContent={content}
          extensions={ext}
          onUpdate={handleUpdate}
        ></EditorContent>
      </EditorRoot>
    </div>
  );
};

export default RichTextEditor;
