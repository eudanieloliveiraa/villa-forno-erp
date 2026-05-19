import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Mock auth — substituir por Supabase no futuro (ver src/lib/supabase.ts).
export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: async (email, password) => {
        if (!email || password.length < 3) return false;
        set({
          user: {
            id: "u1",
            email,
            name: email.split("@")[0] ?? "Pizzaiolo",
          },
        });
        return true;
      },
      logout: () => set({ user: null }),
    }),
    { name: "villa-forno-auth" },
  ),
);