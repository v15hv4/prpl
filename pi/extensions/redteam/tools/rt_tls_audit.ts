import { tool } from "../lib/tool_runner"; import { parseLines } from "../lib/parsers";
export const rt_tls_audit = (host: string) => tool("rt_tls_audit", "testssl.sh", ["--severity", "HIGH", `https://${host}`], { host }, parseLines);
