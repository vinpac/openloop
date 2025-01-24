import { ApiKeyInput } from "@/components/ApiKeyInput";
import { FileDropdown } from "@/components/file-dropdown";
import { Logo } from "@/components/Logo";
import { RunButton } from "@/components/RunButton";
import { DownloadFlowButton } from "@/download-flow-button";

export const Header = ({ onRun }: { onRun: () => void }) => {
  return (
    <div className="absolute h-14 top-0 left-0 right-0 px-4 z-50 flex items-center gap-2 border-b bg-white">
      <Logo className="text-3xl" />
      <ApiKeyInput />
      <div className="ml-auto flex items-center gap-2">
        <FileDropdown />
        <RunButton onRun={onRun} />
      </div>
    </div>
  );
};
