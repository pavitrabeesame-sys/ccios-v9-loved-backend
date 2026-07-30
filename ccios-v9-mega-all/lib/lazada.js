import crypto from "crypto";

// Lazada Open Platform integration (Alibaba TOP signature scheme).
// Docs: https://open.lazada.com/apps/doc/api
//
// Setup needed (see README):
// 1. Register an app at https://open.lazada.com/ → get APP_KEY + APP_SECRET
// 2. Set LAZADA_APP_KEY / LAZADA_APP_SECRET / LAZADA_REGION in env vars
//    (LAZADA_REGION picks the country endpoint, e.g. "my" for Malaysia)
// 3. Authorize your seller account by visiting /api/auth/lazada — this
//    redirects you to Lazada, you approve, and it comes back with tokens.
//
// NOTE ON TOKEN STORAGE: same caveat as lib/shopee.js — this in-memory store
// is a starting point only and will not survive serverless cold starts.
// Swap it for Vercel KV / Redis / a database for production use.

const APP_KEY = process.env.LAZADA_APP_KEY;
const APP_SECRET = process.env.LAZADA_APP_SECRET;
const REGION = process.env.LAZADA_REGION || "my"; // my, sg, th, ph, vn, id
const API_HOST = `https://api.lazada.${REGION === "id" ? "co.id" : REGION}/rest`;
const AUTH_HOST = "https://auth.lazada.com/rest";

const mem = globalThis.__lazadaTokenStore || (globalThis.__lazadaTokenStore = {});
export const tokenStore = {
  get: () => mem.default,
  set: (tokens) => (mem.default = tokens),
  has: () => Boolean(mem.default),
};

export function isConfigured() {
  return Boolean(APP_KEY && APP_SECRET);
}

function sign(path, params) {
  const sorted = Object.keys(params).sort();
  let base = path;
  for (const k of sorted) base += k + params[k];
  return crypto.createHmac("sha256", APP_SECRET).update(base, "utf8").digest("hex").toUpperCase();
}

export function buildAuthUrl(redirectUrl) {
  const url = new URL("https://auth.lazada.com/oauth/authorize");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("force_auth", "true");
  url.searchParams.set("redirect_uri", redirectUrl);
  url.searchParams.set("client_id", APP_KEY);
  return url.toString();
}

export async function exchangeCodeForToken(code) {
  const path = "/auth/token/create";
  const params = { app_key: APP_KEY, timestamp: Date.now(), sign_method: "sha256", code };
  const signature = sign(path, params);
  const url = new URL(AUTH_HOST + path);
  Object.entries({ ...params, sign: signature }).forEach(([k, v]) => url.searchParams.set(k, v));

  const r = await fetch(url.toString(), { method: "POST" });
  const j = await r.json();
  if (j.access_token) {
    tokenStore.set({ access_token: j.access_token, refresh_token: j.refresh_token, obtained_at: Date.now(), expires_in: j.expires_in });
  }
  return j;
}

async function refreshIfNeeded() {
  const t = tokenStore.get();
  if (!t) return null;
  const ageSeconds = (Date.now() - t.obtained_at) / 1000;
  if (ageSeconds < (t.expires_in || 2592000) - 300) return t;

  const path = "/auth/token/refresh";
  const params = { app_key: APP_KEY, timestamp: Date.now(), sign_method: "sha256", refresh_token: t.refresh_token };
  const signature = sign(path, params);
  const url = new URL(AUTH_HOST + path);
  Object.entries({ ...params, sign: signature }).forEach(([k, v]) => url.searchParams.set(k, v));

  const r = await fetch(url.toString(), { method: "POST" });
  const j = await r.json();
  if (j.access_token) {
    const updated = { access_token: j.access_token, refresh_token: j.refresh_token, obtained_at: Date.now(), expires_in: j.expires_in };
    tokenStore.set(updated);
    return updated;
  }
  return t;
}

// Calls a Lazada REST GET endpoint for the authorized seller account.
export async function lazadaGet(path, params = {}) {
  if (!isConfigured()) throw new Error("Lazada credentials not configured (LAZADA_APP_KEY / LAZADA_APP_SECRET)");
  const t = await refreshIfNeeded();
  if (!t) throw new Error("No Lazada token on file. Authorize via /api/auth/lazada first.");

  const allParams = { app_key: APP_KEY, timestamp: Date.now(), sign_method: "sha256", access_token: t.access_token, ...params };
  const signature = sign(path, allParams);
  const url = new URL(API_HOST + path);
  Object.entries({ ...allParams, sign: signature }).forEach(([k, v]) => url.searchParams.set(k, v));

  const r = await fetch(url.toString());
  return r.json();
}
