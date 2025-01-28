import { ApiKeyInput } from "@/components/ApiKeyInput";
import { FileDropdown } from "@/components/file-dropdown";
import { FlowSelector } from "@/components/flow-selector";
import { Logo } from "@/components/Logo";
import { RunButton } from "@/components/RunButton";
import { ShareButton } from "@/components/share-button";
import { Button } from "@/components/ui/button";
import { FaGithub } from "react-icons/fa6";

export const Header = ({ onRun }: { onRun: () => void }) => {
  return (
    <div className="absolute h-12 top-0 left-0 right-0 px-4 z-50 flex items-center gap-2 border-b bg-white">
      <Logo className="text-3xl" />
      <ApiKeyInput />
      <FlowSelector />
      <div className="ml-auto flex items-center gap-2">
        <Button asChild variant="outline">
          <a
            href="https://github.com/vinpac/openloop"
            target="_blank"
            rel="noreferrer"
          >
            <FaGithub />
          </a>
        </Button>
        <FileDropdown />
        <ShareButton />
        <RunButton onRun={onRun} />
      </div>
    </div>
  );
};
