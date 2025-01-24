import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ApiKeyState {
  openaiKey: string | null;
  setOpenaiKey: (key: string) => void;
}

export const useApiKeyStore = create<ApiKeyState>()(
  persist(
    (set) => ({
      openaiKey: null,
      setOpenaiKey: (key) => set({ openaiKey: key }),
    }),
    {
      name: "api-key-store",
    }
  )
);
