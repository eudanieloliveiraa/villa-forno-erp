/**
 * TODO: Integração futura com Supabase / Lovable Cloud.
 *
 * 1. Ative o Lovable Cloud (ou crie um projeto Supabase).
 * 2. Preencha as variáveis abaixo via .env:
 *      VITE_SUPABASE_URL=...
 *      VITE_SUPABASE_PUBLISHABLE_KEY=...
 * 3. Substitua `mockAuth` por `supabase.auth.signInWithPassword` no
 *    arquivo `src/store/auth.ts`.
 * 4. Crie as tabelas seguindo as interfaces em `src/types/index.ts`.
 * 5. Habilite RLS e políticas por usuário.
 */

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// Placeholder — substituir por createClient quando ativar.
export const supabase = null as unknown as never;