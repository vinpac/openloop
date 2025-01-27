import { cx } from "class-variance-authority";
import Markdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = {
  className?: string;
  children: string;
  proseClassName?: string;
};
export const RichText = ({
  className,
  proseClassName = "prose-sm md:prose",
  children,
}: Props) => {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      className={cx(
        proseClassName,
        "max-w-none text-stone-800 [&_p]:m-0",
        className
      )}
      components={COMPONENTS}
    >
      {children}
    </Markdown>
  );
};

const COMPONENTS: Components = {
  li: ({ children }) => {
    return <li className="my-0 py-0">{children}</li>;
  },
  ol: ({ children }) => {
    return <ol className="my-0 py-0">{children}</ol>;
  },
  ul: ({ children }) => {
    return <ul className="my-0 py-0">{children}</ul>;
  },
};
