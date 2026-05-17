import { createHash } from "node:crypto";
import { ALLOWED_ACTIONS, ACCOUNT_ROLES, RoeSpec } from "./types";

export function sha256(s: string) { return createHash("sha256").update(s).digest("hex"); }

export function parseSimpleYaml(src: string): any {
  const root: any = {}; const stack: Array<{ indent: number; obj: any }> = [{ indent: -1, obj: root }];
  const lines = src.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]; if (!raw.trim() || raw.trimStart().startsWith("#")) continue;
    const indent = raw.match(/^ */)?.[0].length ?? 0; const line = raw.trim();
    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) stack.pop();
    const parent = stack[stack.length - 1].obj;
    if (line.startsWith("- ")) { if (!Array.isArray(parent)) throw new Error(`Invalid YAML array item at line ${i + 1}`); parent.push(parseYamlScalar(line.slice(2))); continue; }
    const m = line.match(/^([^:]+):(.*)$/); if (!m) throw new Error(`Invalid YAML at line ${i + 1}`);
    const key = m[1].trim(); const rest = m[2].trim();
    if (rest) parent[key] = parseYamlScalar(rest); else { const next = nextContentLine(lines, i + 1); const child: any = next?.trim().startsWith("- ") ? [] : {}; parent[key] = child; stack.push({ indent, obj: child }); }
  }
  return root;
}
function nextContentLine(lines: string[], start: number) { for (let i = start; i < lines.length; i++) if (lines[i].trim() && !lines[i].trimStart().startsWith("#")) return lines[i]; }
function parseYamlScalar(value: string): any { const v = value.replace(/\s+#.*$/, "").trim(); if (v === "[]") return []; if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) return v.slice(1, -1); if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v); if (v === "true") return true; if (v === "false") return false; return v; }

export function validateRoe(raw: any): RoeSpec {
  const errors: string[] = [];
  const domains = Array.isArray(raw?.targets?.domains) ? raw.targets.domains.map((d: any) => normalizeDomain(String(d), errors)) : (errors.push("targets.domains is required"), []);
  const exclusions = { domains: Array.isArray(raw?.exclusions?.domains) ? raw.exclusions.domains.map((d: any) => normalizeDomain(String(d), errors)) : [], paths: Array.isArray(raw?.exclusions?.paths) ? raw.exclusions.paths.map((p: any) => validatePath(String(p), errors)) : [] };
  const allowed = Array.isArray(raw?.allowed_actions) ? raw.allowed_actions : (errors.push("allowed_actions is required"), []);
  for (const a of allowed) if (!ALLOWED_ACTIONS.includes(a)) errors.push(`invalid allowed action: ${a}`);
  const accounts: RoeSpec["accounts"] = {};
  if (raw.accounts && typeof raw.accounts === "object") for (const [name, a] of Object.entries<any>(raw.accounts)) { if (!a || typeof a !== "object") { errors.push(`account ${name} must be object`); continue; } if (!ACCOUNT_ROLES.includes(a.role)) errors.push(`account ${name} has invalid role`); if (a.secret_ref && !String(a.secret_ref).startsWith("env:")) errors.push(`account ${name} secret_ref must be env:NAME`); accounts[name] = { username: a.username, secret_ref: a.secret_ref, role: a.role }; }
  if (!raw?.assessment_name) errors.push("assessment_name is required");
  if (!raw?.rate_limits?.requests_per_second || !raw?.rate_limits?.concurrent_hosts) errors.push("rate_limits.requests_per_second and concurrent_hosts are required");
  if (domains.length === 0) errors.push("at least one target domain is required");
  if (errors.length) throw new Error(`Invalid roe.yml:\n- ${errors.join("\n- ")}`);
  return { assessment_name: String(raw.assessment_name), targets: { domains }, exclusions, accounts, allowed_actions: allowed as any, rate_limits: { requests_per_second: Number(raw.rate_limits.requests_per_second), concurrent_hosts: Number(raw.rate_limits.concurrent_hosts) } };
}
function normalizeDomain(input: string, errors: string[]) { const d = input.trim().toLowerCase(); const bare = d.startsWith("*.") ? d.slice(2) : d; if (/^https?:\/\//.test(d) || d.includes("/") || d.includes(":") || /^\d+\.\d+\.\d+\.\d+/.test(bare)) errors.push(`invalid domain specifier: ${input}`); if (!/^[a-z0-9][a-z0-9.-]*[a-z0-9]$/.test(bare) || !bare.includes(".")) errors.push(`invalid domain specifier: ${input}`); return d; }
function validatePath(path: string, errors: string[]) { if (!path.startsWith("/")) errors.push(`path exclusion must start with /: ${path}`); return path; }
export function serializeRoe(roe: RoeSpec) { const out: string[] = []; const q = (s: string) => JSON.stringify(s); const list = (name: string, values: string[], indent = "") => { if (!values.length) out.push(`${indent}${name}: []`); else { out.push(`${indent}${name}:`); values.forEach((v) => out.push(`${indent}  - ${q(v)}`)); } }; out.push(`assessment_name: ${q(roe.assessment_name)}`, "targets:"); list("domains", roe.targets.domains, "  "); list("allowed_actions", roe.allowed_actions); out.push("rate_limits:", `  requests_per_second: ${roe.rate_limits.requests_per_second}`, `  concurrent_hosts: ${roe.rate_limits.concurrent_hosts}`, "exclusions:"); list("domains", roe.exclusions.domains, "  "); list("paths", roe.exclusions.paths, "  "); if (Object.keys(roe.accounts).length) { out.push("accounts:"); for (const [name, a] of Object.entries(roe.accounts)) { out.push(`  ${name}:`); if (a.username) out.push(`    username: ${q(a.username)}`); if (a.secret_ref) out.push(`    secret_ref: ${q(a.secret_ref)}`); out.push(`    role: ${a.role}`); } } return out.join("\n") + "\n"; }
