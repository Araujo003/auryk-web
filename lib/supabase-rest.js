(function (global) {
  "use strict";
  const cfg = global.AURYK_CONFIG || {};
  const configured = /^https:\/\//.test(cfg.supabaseUrl || "") && !/TU-PROYECTO/.test(cfg.supabaseUrl || "") && !!cfg.supabaseAnonKey && !/^TU_/.test(cfg.supabaseAnonKey);
  const key = "auryk.supabase.session";
  let session = null;
  try { session = JSON.parse(localStorage.getItem(key) || "null"); } catch (_) {}

  function headers(extra, auth = true) {
    const h = { apikey: cfg.supabaseAnonKey || "", ...extra };
    if (auth && session?.access_token) h.Authorization = `Bearer ${session.access_token}`;
    return h;
  }
  async function request(path, options = {}) {
    if (!configured) throw new Error("Supabase no está configurado.");
    const res = await fetch(`${cfg.supabaseUrl}${path}`, { ...options, headers: headers(options.headers, options.auth !== false) });
    const type = res.headers.get("content-type") || "";
    const body = type.includes("json") ? await res.json() : await res.text();
    if (!res.ok) throw new Error(body?.message || body?.error_description || body?.error || `Error ${res.status}`);
    return body;
  }
  function saveSession(value) {
    session = value;
    if (value) localStorage.setItem(key, JSON.stringify(value)); else localStorage.removeItem(key);
    return value;
  }
  async function signIn(email, password) {
    return saveSession(await request("/auth/v1/token?grant_type=password", { method: "POST", auth: false, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) }));
  }
  async function resetPassword(email, redirectTo) {
    return request("/auth/v1/recover", { method: "POST", auth: false, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, redirect_to: redirectTo }) });
  }
  async function refresh() {
    if (!session?.refresh_token) return null;
    try { return saveSession(await request("/auth/v1/token?grant_type=refresh_token", { method: "POST", auth: false, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ refresh_token: session.refresh_token }) })); }
    catch (_) { return saveSession(null); }
  }
  async function user() { return request("/auth/v1/user"); }
  async function isAdmin() {
    const rows = await select("profiles", "select=id,email,role,is_active&limit=1");
    return rows[0]?.role === "admin" && rows[0]?.is_active === true;
  }
  function signOut() { saveSession(null); }
  function select(table, query = "") { return request(`/rest/v1/${table}?${query}`, { headers: { Accept: "application/json" } }); }
  function insert(table, value) { return request(`/rest/v1/${table}`, { method: "POST", headers: { "Content-Type": "application/json", Prefer: "return=representation" }, body: JSON.stringify(value) }); }
  function update(table, id, value) { return request(`/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", headers: { "Content-Type": "application/json", Prefer: "return=representation" }, body: JSON.stringify(value) }); }
  function remove(table, id) { return request(`/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`, { method: "DELETE", headers: { Prefer: "return=representation" } }); }
  async function upload(bucket, path, blob, contentType) {
    return request(`/storage/v1/object/${bucket}/${path}`, { method: "POST", headers: { "Content-Type": contentType, "x-upsert": "false" }, body: blob });
  }
  function publicUrl(bucket, path) { return `${cfg.supabaseUrl}/storage/v1/object/public/${bucket}/${path}`; }
  global.AurykAPI = { configured, config: cfg, get session() { return session; }, signIn, resetPassword, refresh, user, isAdmin, signOut, select, insert, update, remove, upload, publicUrl };
})(window);
