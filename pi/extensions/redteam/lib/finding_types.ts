import { Finding, Severity } from "./types";
export function makeFinding(n: number, data: Omit<Finding, "id" | "created_at">): Finding { return { id: `F${String(n).padStart(3, "0")}`, created_at: new Date().toISOString(), ...data }; }
export function severityRank(s: Severity) { return ({ CRITICAL: 5, HIGH: 4, MEDIUM: 3, LOW: 2, INFO: 1 } as any)[s] ?? 0; }
