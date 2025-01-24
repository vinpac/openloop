import { useApiKeyStore } from "@/stores/api-key-store";
import { Input } from "./ui/input";
import { TbBrandOpenai } from "react-icons/tb";

export function ApiKeyInput() {
  const { openaiKey, setOpenaiKey } = useApiKeyStore();

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <TbBrandOpenai className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2" />

        <Input
          type="password"
          placeholder="OpenAI API Key"
          value={openaiKey || ""}
          onChange={(e) => setOpenaiKey(e.target.value)}
          className="pl-7 w-64"
        />
      </div>
      {openaiKey && (
        <div className="text-xs text-green-600 font-medium">API Key Set</div>
      )}
    </div>
  );
}
