import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { tsTool } from "../lib/tool_runner";
export const rt_js_analyze = (url: string) => tsTool("rt_js_analyze", { url, candidate_policy: "absolute URLs to other hosts become candidates only", tools: ["katana", "linkfinder", "jsluice"] }, async () => {
  const crawl = await run("katana", ["-u", url, "-d", "2", "-jc", "-kf", "-silent"]);
  const jsUrls = Array.from(new Set(crawl.stdout.split(/\r?\n/).filter((l) => /\.js(\?|$)/i.test(l))));
  const dir = await mkdtemp(join(tmpdir(), "rt-js-"));
  const lines: string[] = [];
  for (const js of jsUrls.slice(0, 50)) {
    lines.push(`JS_URL ${js}`);
    const body = await fetch(js).then((r) => r.text()).catch(() => "");
    const file = join(dir, encodeURIComponent(js).slice(0, 80) + ".js");
    await writeFile(file, body);
    const lf = await run("linkfinder", ["-i", file, "-o", "cli"]); if (lf.code === 0) lines.push(lf.stdout);
    const urls = await run("jsluice", ["urls", file]); if (urls.code === 0) lines.push(urls.stdout);
    const secrets = await run("jsluice", ["secrets", file]); if (secrets.code === 0) lines.push(secrets.stdout);
  }
  await rm(dir, { recursive: true, force: true });
  return { code: crawl.code === 127 ? 127 : 0, result: { lines: lines.join("\n").split(/\r?\n/).filter(Boolean), js_urls: jsUrls } };
});
function run(command: string, args: string[]): Promise<{ stdout: string; stderr: string; code: number }> { return new Promise((resolve) => { const p = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] }); let stdout = "", stderr = ""; p.stdout.on("data", (d) => stdout += d.toString()); p.stderr.on("data", (d) => stderr += d.toString()); p.on("error", (e) => resolve({ stdout, stderr: String(e), code: 127 })); p.on("close", (code) => resolve({ stdout, stderr, code: code ?? 0 })); }); }
