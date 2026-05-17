import { spawn } from "node:child_process";
import { tool, tsTool } from "../lib/tool_runner";
import { parseCrtSh, parseSubdomains } from "../lib/parsers";
export interface SubdomainEnumOutput { subdomains: string[]; sources: Record<string, number>; wildcardDetected: boolean; internalNames: string[]; }
export const rt_crtsh = (domain: string) => tool("rt_subdomain_enum_crtsh", "curl", ["-fsSL", `https://crt.sh/?q=%25.${domain}&output=json`], { domain, source: "crt.sh" }, parseCrtSh);
export const rt_subfinder = (domain: string) => tool("rt_subdomain_enum_subfinder", "subfinder", ["-d", domain, "-all", "-recursive", "-silent"], { domain }, parseSubdomains);
export const rt_amass_passive = (domain: string) => tool("rt_subdomain_enum_amass", "amass", ["enum", "-passive", "-d", domain], { domain, passive_only: true }, parseSubdomains);
export const rt_subdomain_enum = (domain: string) => tsTool("rt_subdomain_enum", { domain }, async () => {
  const sourceLists: Record<string, string[]> = {};
  sourceLists.subfinder = split((await run("subfinder", ["-d", domain, "-all", "-recursive", "-silent"])).stdout);
  sourceLists.amass = split((await run("amass", ["enum", "-passive", "-d", domain])).stdout);
  try { const rows: any = await fetch(`https://crt.sh/?q=%25.${domain}&output=json`).then((r) => r.json()); sourceLists.crt_sh = rows.flatMap((r: any) => String(r.name_value ?? "").split(/\n/)); } catch { sourceLists.crt_sh = []; }
  const subdomains = Array.from(new Set(Object.values(sourceLists).flat().map((s) => s.trim().toLowerCase().replace(/^\*\./, "")).filter((s) => s.endsWith(`.${domain}`) || s === domain))).sort();
  return { code: subdomains.length ? 0 : 2, result: { subdomains, sources: Object.fromEntries(Object.entries(sourceLists).map(([k, v]) => [k, v.length])), wildcardDetected: false, internalNames: subdomains.filter((s) => /(internal|staging|admin|jenkins|grafana|kibana|vpn|dev|preview|k8s|kubernetes)/.test(s)) } satisfies SubdomainEnumOutput };
});
function split(s: string) { return s.split(/\r?\n/).map((x) => x.trim()).filter(Boolean); }
function run(command: string, args: string[]): Promise<{ stdout: string; stderr: string; code: number }> { return new Promise((resolve) => { const p = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] }); let stdout = "", stderr = ""; p.stdout.on("data", (d) => stdout += d.toString()); p.stderr.on("data", (d) => stderr += d.toString()); p.on("error", (e) => resolve({ stdout, stderr: String(e), code: 127 })); p.on("close", (code) => resolve({ stdout, stderr, code: code ?? 0 })); }); }
