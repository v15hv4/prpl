import { tool } from "../lib/tool_runner"; import { parseLines } from "../lib/parsers";
export const rt_whois = (domain: string) => tool("rt_whois", "whois", [domain], { domain }, parseLines);
