import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { tsTool } from "../lib/tool_runner";

async function lines(file: string) { return (await readFile(file, "utf8")).split(/\r?\n/).map((s) => s.trim()).filter(Boolean); }
async function probe(url: string, token?: string) { if (!token) return { status: 0, body_hash: null, bytes: 0 }; const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } }).catch((e) => ({ status: 0, text: async () => String(e) } as any)); const body = await (res as any).text().catch(() => ""); const hash = createHash("sha256").update(body).digest("hex"); return { status: (res as any).status ?? 0, body_hash: hash, bytes: body.length }; }
export const rt_auth_diff = (accounts: string[], endpointFile?: string, tokenAEnv?: string, tokenBEnv?: string) => tsTool("rt_auth_diff", { accounts, endpointFile, tokenAEnv, tokenBEnv }, async () => {
  if (!endpointFile || !tokenAEnv || !tokenBEnv || !process.env[tokenAEnv] || !process.env[tokenBEnv]) return { code: 2, result: { status: "BLOCKED_MISSING_INPUT", requirement: "endpoint file plus token_a/token_b env refs" } };
  const endpoints = await lines(endpointFile);
  const items = [];
  for (const url of endpoints) { const a = await probe(url, process.env[tokenAEnv]); const b = await probe(url, process.env[tokenBEnv]); items.push({ url, token_a_status: a.status, token_b_status: b.status, same_body: a.body_hash === b.body_hash, bytes_a: a.bytes, bytes_b: b.bytes }); }
  return { code: 0, result: { items } };
});
export const rt_auth_bypass = (endpointFile?: string, tokenEnv?: string) => tsTool("rt_auth_bypass", { endpointFile, tokenEnv, variants: ["//", "/.", "%2f", "X-Original-URL", "X-HTTP-Method-Override"] }, async () => {
  if (!endpointFile || !tokenEnv || !process.env[tokenEnv]) return { code: 2, result: { status: "BLOCKED_MISSING_INPUT", requirement: "403/401 endpoint file plus token env ref" } };
  const endpoints = await lines(endpointFile);
  const items = [];
  for (const url of endpoints) for (const variant of [url, `${url}/`, `${url}/.`, url.replace(/\/$/, "%2f")]) { const res = await fetch(variant, { headers: { Authorization: `Bearer ${process.env[tokenEnv]}` } }).catch((e) => ({ status: 0 } as any)); items.push({ url: variant, status: (res as any).status ?? 0 }); }
  return { code: 0, result: { items } };
});
