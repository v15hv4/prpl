import { tool } from "../lib/tool_runner"; import { parseLines } from "../lib/parsers";
export const rt_httpx_probe = (targetFile: string, targets: string[]) => tool("rt_httpx_probe", "httpx", ["-l", targetFile, "-title", "-tech-detect", "-status-code", "-location"], { targets, candidate_policy: "different-host redirects recorded, not followed by planner" }, parseLines);
