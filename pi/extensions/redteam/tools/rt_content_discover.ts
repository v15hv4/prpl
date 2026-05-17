import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { tsTool } from "../lib/tool_runner";
import { parseJsonish } from "../lib/parsers";
export const rt_content_discover = (url: string, excludedPaths: string[], authEnv?: string) => tsTool("rt_content_discover", { url, excludedPaths, authEnv, enforcement: "wordlist entries with excluded path prefixes are removed before ffuf/feroxbuster" }, async () => {
  if (excludedPaths.includes("/")) return { code: 0, result: { skipped: true, reason: "root path excluded" } };
  const wordlist = "/usr/share/seclists/Discovery/Web-Content/raft-small-words.txt";
  let words: string[];
  try { words = (await readFile(wordlist, "utf8")).split(/\r?\n/); } catch { return { code: 127, result: { error: { code: "MISSING_WORDLIST", message: wordlist } } }; }
  const excludedRoots = new Set(excludedPaths.map((p) => p.replace(/^\//, "").split("/")[0]).filter(Boolean));
  const filtered = words.filter((w) => w && !excludedRoots.has(w.replace(/^\//, "").split("/")[0]));
  const dir = await mkdtemp(join(tmpdir(), "rt-content-"));
  const filteredPath = join(dir, "words.txt");
  await writeFile(filteredPath, filtered.join("\n"));
  const headerArgs = authEnv && process.env[authEnv] ? ["-H", `Authorization: Bearer ${process.env[authEnv]}`] : [];
  const ffuf = await run("ffuf", ["-u", `${url.replace(/\/$/, "")}/FUZZ`, "-w", filteredPath, ...headerArgs, "-mc", "200,201,204,301,302,307,401,403,405", "-of", "json"]);
  await rm(dir, { recursive: true, force: true });
  const result = parseJsonish(ffuf.stdout);
  return { code: ffuf.code, stderr: ffuf.stderr, result };
});
function run(command: string, args: string[]): Promise<{ stdout: string; stderr: string; code: number }> { return new Promise((resolve) => { const p = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] }); let stdout = "", stderr = ""; p.stdout.on("data", (d) => stdout += d.toString()); p.stderr.on("data", (d) => stderr += d.toString()); p.on("error", (e) => resolve({ stdout, stderr: String(e), code: 127 })); p.on("close", (code) => resolve({ stdout, stderr, code: code ?? 0 })); }); }
