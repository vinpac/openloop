import * as React from "react";

import { cn } from "@/lib/utils";
import TextareaAutosize, {
  TextareaAutosizeProps,
} from "react-textarea-autosize";

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaAutosizeProps>(
  ({ className, ...props }, ref) => {
    return (
      <TextareaAutosize
        className={cn(
          "flex min-h-[80px] w-full rounded-md border-2 border-stone-200 bg-white px-2 py-2 text-base  placeholder:text-stone-500 focus-visible:outline-none  focus-visible:border-stone-950 focus-visible:ring-stone-950 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:border-stone-800 dark:bg-stone-950 dark:ring-offset-stone-950 dark:placeholder:text-stone-400 dark:focus-visible:ring-stone-300",
          className
        )}
        // not worrying about the props type here for the challenge
        ref={ref as unknown}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {...(props as any)}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
