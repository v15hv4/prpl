# RedTeam Pi Extension

Autonomous red team penetration testing extension for Pi.

## Installation

Copy this folder to `.pi/extensions/redteam/` in your project. Pi auto-discovers extensions in this location.

```
your-project/
└── .pi/
    └── extensions/
        └── redteam/    ← this folder
```

## Features

### 🚀 Parallel Red Team Attacks (NEW!)

The `/redteam` command spawns multiple subagents in parallel, each executing a specialized attack:

```bash
/redteam 192.168.1.100           # Run ALL attacks in parallel
/redteam example.com recon       # Reconnaissance only
/redteam example.com web         # Web attacks only
/redteam 10.0.0.5 vuln           # Vulnerability scanning only
/redteam 10.0.0.5 auth           # Credential attacks only
```

**Attack Categories:**

| Category | Subagents |
|----------|-----------|
| `recon` | Port scanning, web discovery, DNS enumeration |
| `vuln` | Automated vulnerability scanning, exploit research |
| `web` | SQL injection, XSS, LFI/RFI, SSRF |
| `auth` | Credential brute force attacks |

When you run `/redteam <target>`, Pi spawns 10 subagents simultaneously:
- Each subagent has its own context window
- All attacks run in parallel
- Results are compiled automatically
- Vulnerabilities are recorded to the engagement state

### Slash Commands

| Command | Description |
|---------|-------------|
| `/redteam <target> [category]` | 🚀 **Parallel attacks** - spawn all subagents |
| `/redteam-recon <target>` | 🔍 Parallel reconnaissance only |
| `/redteam-web <target>` | 🌐 Parallel web attacks only |
| `/redteam-vuln <target>` | 🔎 Parallel vulnerability scanning |
| `/redteam-auth <target>` | 🔑 Credential brute force |
| `/agents` | 📋 List all available attack subagents |
| `/recon <target>` | Sequential reconnaissance (nmap, gobuster, nikto) |
| `/exploit <target>` | Attempt exploitation of vulnerabilities |
| `/bruteforce <target> <service>` | Credential brute force attacks |
| `/web <target>` | Web application security testing |
| `/privesc` | Linux privilege escalation enumeration |
| `/lateral` | Lateral movement techniques |
| `/finding <severity> <title>` | Record a vulnerability finding |
| `/report` | Generate comprehensive VAPT report |
| `/status` | Show current engagement status |
| `/install-tool <name>` | Install additional pentest tools |
| `/msf [module]` | Launch Metasploit Framework |

### Custom Tools (LLM-callable)

- `record_finding` - Document vulnerabilities with severity, description, evidence, remediation
- `list_findings` - Show all recorded findings
- `engagement_info` - Get current engagement status

### Skills

| Skill | Description |
|-------|-------------|
| `reconnaissance` | Port scanning, service enumeration, DNS discovery |
| `web-exploitation` | SQLi, XSS, LFI, SSRF testing methodologies |
| `privilege-escalation` | Linux privesc enumeration and exploitation |
| `password-attacks` | Brute forcing and hash cracking workflows |
| `active-directory` | AD enumeration, attacks, lateral movement |
| `metasploit` | MSF usage guide and common workflows |
| `vapt-report` | Report generation structure and guidelines |

## Attack Subagents

The following subagents are available for parallel execution:

### Reconnaissance
- **recon-portscan** - Comprehensive port scanning (nmap TCP/UDP, service detection, OS fingerprinting)
- **recon-web** - Web content discovery (gobuster, whatweb, robots.txt, hidden files)
- **dns-enum** - DNS enumeration (records, zone transfer, subdomains)

### Vulnerability Assessment
- **vuln-scan** - Automated scanning (nikto, nuclei, nmap scripts, SSL analysis)
- **exploit-search** - Exploit research (searchsploit, metasploit modules)

### Web Application Attacks
- **sqli-attack** - SQL injection testing (sqlmap, manual payloads)
- **xss-attack** - Cross-site scripting (dalfox, manual payloads)
- **lfi-rfi-attack** - File inclusion (path traversal, PHP wrappers, log poisoning)
- **ssrf-attack** - Server-side request forgery (localhost, cloud metadata, internal scanning)

### Authentication Attacks
- **bruteforce-attack** - Credential brute force (hydra SSH/FTP/HTTP, default creds)

## Permissions

This extension injects **full unrestricted access** via the `before_agent_start` event:

- ✅ Execute ANY shell command including sudo
- ✅ Full root access without password prompts
- ✅ Install any package (apt, pip, npm, source)
- ✅ Run offensive security tools
- ✅ Perform active exploitation
- ✅ Modify system configuration

**These permissions only apply when this extension is loaded.**

## VAPT Report

After an engagement, use `/report` to generate `VAPT_REPORT.md` with:

1. Executive Summary
2. Scope & Methodology  
3. Findings (Critical → High → Medium → Low → Info)
4. Remediation Roadmap
5. Appendices

## Pre-installed Tools (Kali)

**Reconnaissance**: nmap, masscan, gobuster, nikto, nuclei, amass
**Exploitation**: metasploit-framework, sqlmap, searchsploit
**Password**: hydra, john, hashcat
**AD/SMB**: crackmapexec, impacket, bloodhound, responder
**Network**: wireshark, netcat, proxychains4, chisel
**Wordlists**: /usr/share/seclists/, /usr/share/wordlists/rockyou.txt

## Example Workflow

```bash
# 1. Launch full parallel red team engagement
/redteam 192.168.1.100

# 2. Review findings
/status

# 3. Do additional manual testing based on results
/exploit 192.168.1.100
/privesc

# 4. Generate report
/report
```

## Structure

```
redteam/
├── index.ts              # Extension (commands, tools, subagent tasks)
├── package.json          # Manifest with pi.extensions and pi.skills
├── README.md             # This file
├── agents/               # Attack agent definitions (for reference)
│   ├── recon-portscan.md
│   ├── recon-web.md
│   ├── dns-enum.md
│   ├── vuln-scan.md
│   ├── exploit-search.md
│   ├── sqli-attack.md
│   ├── xss-attack.md
│   ├── lfi-rfi-attack.md
│   ├── ssrf-attack.md
│   └── bruteforce-attack.md
├── docs/
│   └── PRD.md            # Product requirements
└── skills/
    ├── active-directory/
    ├── metasploit/
    ├── password-attacks/
    ├── privilege-escalation/
    ├── reconnaissance/
    ├── vapt-report/
    └── web-exploitation/
```
