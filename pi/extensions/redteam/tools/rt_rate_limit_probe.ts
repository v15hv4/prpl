import { tool } from "../lib/tool_runner"; import { parseLines } from "../lib/parsers";
export const rt_rate_limit_probe = (url: string) => tool("rt_rate_limit_probe", "curl", ["-sS", "-o", "/dev/null", "-w", "%{http_code}", url], { url, requests: 1, note: "single safe probe; increase only within RoE" }, parseLines);
