import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";

// Substitua pelos dados do SEU projeto (Settings > API no dashboard do Supabase)
const SUPABASE_URL = "https://ipygruvcwppjlwcynzkh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_jG-KGXVYrHXeXej_UeFvJg_vdPJT8j3";

// O app não usa o sistema de autenticação/sessão do Supabase (o login é feito
// manualmente consultando a tabela `users` e guardando o resultado no
// AsyncStorage). Por isso desligamos a persistência de sessão do supabase-js:
// isso evita que ele tente ler storage do navegador durante o
// server-side rendering do Expo Router na web (onde `window` não existe).
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});
