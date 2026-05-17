import { tool } from "../lib/tool_runner"; import { parseHeaders } from "../lib/parsers";
export const rt_cors_test = (url: string) => tool("rt_cors_test", "curl", ["-sSI", "-H", "Origin: https://attacker.example.org", url], { url }, parseHeaders);
