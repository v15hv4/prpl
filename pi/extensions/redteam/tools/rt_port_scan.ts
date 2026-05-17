import { tool } from "../lib/tool_runner";
import { parseLines } from "../lib/parsers";
export const rt_port_scan = (targets: string[]) => tool("rt_port_scan", "nmap", ["-sV", "--top-ports", "100", ...targets.slice(0, 100)], { targets: targets.slice(0, 100), strategy: "nmap top 100 with service/version detection; masscan escalation is intentionally not used unless separately approved" }, parseLines);
