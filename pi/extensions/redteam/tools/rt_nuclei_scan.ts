import { tool } from "../lib/tool_runner"; import { parseJsonLines } from "../lib/parsers";
export const rt_nuclei_scan = (list: string, targets: string[]) => tool("rt_nuclei_scan", "nuclei", ["-l", list, "-severity", "critical,high,medium", "-jsonl"], { targets }, parseJsonLines, { redactRawAfterParse: true });
