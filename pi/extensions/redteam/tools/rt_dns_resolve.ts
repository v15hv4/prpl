import { tool } from "../lib/tool_runner"; import { parseLines } from "../lib/parsers";
export const rt_dns_resolve = (targetFile: string, targets: string[]) => tool("rt_dns_resolve", "dnsx", ["-l", targetFile, "-a", "-resp"], { targets }, parseLines);
export const rt_dns_brute = (domain: string) => tool("rt_dns_brute", "gobuster", ["dns", "-d", domain, "-w", "/usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt", "-q"], { domain }, parseLines);
