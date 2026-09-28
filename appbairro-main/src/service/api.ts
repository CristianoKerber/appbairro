// api.ts
//
// Antes este arquivo chamava um backend em http://localhost:8080 via axios.
// Como o banco de dados original foi perdido, o app agora fala DIRETO com o
// Supabase. Para não precisar mexer em cada tela/serviço que já usava
// `api.get/post/put(url, body)`, mantemos a mesma "cara" de chamada aqui,
// só que por baixo dos panos ela vira uma query no Supabase.

import { supabase } from "./supabaseClient";

type ApiResponse<T = any> = { data: T };

function httpError(status: number, message: string) {
  const err: any = new Error(message);
  err.response = { status, data: { message } };
  return err;
}

function supabaseError(error: { message: string }) {
  return httpError(500, error.message);
}

// ---------- mapeamento entre o formato do app (camelCase) e as tabelas (snake_case) ----------

function toUserJson(row: any) {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    password: row.password,
    phoneNumber: row.phone_number,
    address: row.address,
  };
}

function toCollectJson(row: any) {
  return {
    id: row.id,
    collected: row.collected,
    collectDate: row.collect_date,
    itemName: row.item_name,
    itemDescription: row.item_description,
    quantity: row.quantity,
    userId: row.user_id,
  };
}

function fromCollectBody(body: any, partial = false) {
  const row: Record<string, any> = {};
  const userId = body.userId ?? body.user?.id;

  if (!partial || body.collected !== undefined) row.collected = !!body.collected;
  if (!partial || body.collectDate !== undefined) row.collect_date = body.collectDate ?? null;
  if (!partial || body.itemName !== undefined) row.item_name = body.itemName ?? null;
  if (!partial || body.itemDescription !== undefined) row.item_description = body.itemDescription ?? null;
  if (!partial || body.quantity !== undefined) row.quantity = body.quantity ?? null;
  if (!partial || userId !== undefined) row.user_id = userId ?? null;
  return row;
}

// ---------------------------------------- POST ----------------------------------------

async function post<T = any>(url: string, body: any): Promise<ApiResponse<T>> {
  if (url === "/api/users/save") {
    const { username, password, email, phoneNumber, address } = body;
    const { data, error } = await supabase
      .from("users")
      .insert({ username, password, email, phone_number: phoneNumber, address })
      .select()
      .single();
    if (error) throw supabaseError(error);
    return { data: toUserJson(data) as T };
  }

  if (url === "/api/users/login") {
    const { email, password } = body;
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .eq("password", password)
      .maybeSingle();
    if (error) throw supabaseError(error);
    if (!data) throw httpError(401, "Usuário ou senha incorretos.");
    return { data: toUserJson(data) as T };
  }

  if (url === "/api/collects/save") {
    const row = fromCollectBody(body);
    const { data, error } = await supabase.from("collects").insert(row).select().single();
    if (error) throw supabaseError(error);
    return { data: toCollectJson(data) as T };
  }

  throw httpError(404, `Rota POST não implementada: ${url}`);
}

// ---------------------------------------- GET ----------------------------------------

async function get<T = any>(url: string): Promise<ApiResponse<T>> {
  const cleanUrl = url.replace(/^\//, "");

  if (cleanUrl === "api/users/all") {
    const { data, error } = await supabase.from("users").select("*").order("id");
    if (error) throw supabaseError(error);
    return { data: (data ?? []).map(toUserJson) as T };
  }

  const userIdMatch = cleanUrl.match(/^api\/users\/([^/]+)$/);
  if (userIdMatch) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userIdMatch[1])
      .maybeSingle();
    if (error) throw supabaseError(error);
    if (!data) throw httpError(404, "Usuário não encontrado.");
    return { data: toUserJson(data) as T };
  }

  if (cleanUrl === "api/collects/all") {
    const { data, error } = await supabase
      .from("collects")
      .select("*")
      .order("id", { ascending: false });
    if (error) throw supabaseError(error);
    return { data: (data ?? []).map(toCollectJson) as T };
  }

  if (cleanUrl === "api/collects/latestStatus") {
    const { data, error } = await supabase
      .from("collects")
      .select("*")
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw supabaseError(error);
    return { data: (data ? toCollectJson(data) : null) as T };
  }

  if (cleanUrl.startsWith("api/collects/monthlyDistribution")) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const { data, error } = await supabase
      .from("collects")
      .select("item_name, quantity")
      .gte("created_at", startOfMonth);
    if (error) throw supabaseError(error);

    const totals: Record<string, number> = {};
    (data ?? []).forEach((r: any) => {
      const name = r.item_name || "Outros";
      totals[name] = (totals[name] || 0) + (r.quantity || 0);
    });
    const result = Object.entries(totals).map(([itemName, totalQuantity]) => ({
      itemName,
      totalQuantity,
    }));
    return { data: result as T };
  }

  throw httpError(404, `Rota GET não implementada: ${url}`);
}

// ---------------------------------------- PUT ----------------------------------------

async function put<T = any>(url: string, body: any): Promise<ApiResponse<T>> {
  const userMatch = url.match(/^\/api\/users\/update\/([^/]+)$/);
  if (userMatch) {
    const payload: Record<string, any> = {};
    if (body.username !== undefined) payload.username = body.username;
    if (body.email !== undefined) payload.email = body.email;
    if (body.password !== undefined) payload.password = body.password;
    if (body.phoneNumber !== undefined) payload.phone_number = body.phoneNumber;
    if (body.address !== undefined) payload.address = body.address;

    const { data, error } = await supabase
      .from("users")
      .update(payload)
      .eq("id", userMatch[1])
      .select()
      .single();
    if (error) throw supabaseError(error);
    return { data: toUserJson(data) as T };
  }

  const collectMatch = url.match(/^\/api\/collects\/update\/([^/]+)$/);
  if (collectMatch) {
    const row = fromCollectBody(body, true);
    const { data, error } = await supabase
      .from("collects")
      .update(row)
      .eq("id", collectMatch[1])
      .select()
      .single();
    if (error) throw supabaseError(error);
    return { data: toCollectJson(data) as T };
  }

  throw httpError(404, `Rota PUT não implementada: ${url}`);
}

const api = { get, post, put };
export default api;
