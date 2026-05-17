import { tsTool } from "../lib/tool_runner";
export const rt_report_gen = () => tsTool("rt_report_gen", { format: "markdown" }, async () => ({ code: 0, result: { generated: true, renderer: "lib/report.ts" } }));
