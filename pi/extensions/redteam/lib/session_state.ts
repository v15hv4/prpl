import { mkdir, readFile, writeFile, appendFile } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";
import { SessionState } from "./types";
import { sha256 } from "./roe";
import { redact } from "./parsers";
export const ROOT = join(homedir(), ".prpl", "redteam", "sessions");
export const sessionDir = (id: string) => join(ROOT, id);
export async function loadSession(dir: string): Promise<SessionState> { return JSON.parse(await readFile(join(dir, "session.json"), "utf8")); }
export async function saveSession(dir: string, s: SessionState) { await writeFile(join(dir, "session.json"), JSON.stringify(s, null, 2)); }
export async function appendWork(dir: string, text: string) { await appendFile(join(dir, "work.md"), redact(text)); }
export async function initDirs(dir: string) { await mkdir(join(dir, "outputs"), { recursive: true }); await mkdir(join(dir, "findings"), { recursive: true }); await mkdir(join(dir, "reports"), { recursive: true }); }
export async function verifyRoeHash(dir: string, session: SessionState) { const actual = sha256(await readFile(join(dir, "roe.yml"), "utf8")); if (actual !== session.roe_sha256) throw new Error("Session roe.yml hash mismatch; immutable RoE snapshot was modified"); }
export function rel(dir: string, p: string) { return p.startsWith(dir) ? p.slice(dir.length + 1) : p; }
