# RedTeam Pi Extension

Autonomous red team penetration testing extension for Pi.

## Architecture: Direct Execution + LLM Analysis

This extension uses a **hybrid architecture** that works with any model:

1. **Security tools execute directly** - nmap, nikto, sqlmap, etc. run via Node.js `execSync`
2. **LLM only analyzes output** - The model receives scan results and provides analysis
3. **No model permission issues** - The model never decides whether to run offensive tools

This means you can use restrictive models like Codex without hitting security refusals.

## Installation

Copy this folder to `.pi/extensions/redteam/` in your project:

```
your-project/
└── .pi/
    └── extensions/
        └── redteam/    ← this folder
```

## Commands

### AI-Driven Analysis (NEW)

| Command | Description |
|---------|-------------|
| `/redteam <domain>` | 🧠 **AI Analysis** - Reconnaissance + AI-generated attack variants |
| `/list-variants [filter]` | 📝 List generated attack variants |
| `/test-variants` | 🧪 Run automated tests for generated variants |

The `/redteam` command performs reconnaissance and then uses AI to generate creative attack variants based on the detected technology stack, endpoints, and services. This is the recommended starting point for any engagement.

### Individual Scans

| Command | Description |
|---------|-------------|
| `/recon <target>` | 🔍 Quick reconnaissance (ports, services, web tech, DNS) |
| `/portscan <target>` | 🔌 Full TCP/UDP port scan |
| `/vulnscan <target>` | 🔎 Vulnerability scanning (nmap scripts, nikto, nuclei) |
| `/webscan <url>` | 🌐 Web directory enumeration and sensitive file check |
| `/sqli <url>` | 💉 SQL injection testing with sqlmap |
| `/bruteforce <target> <service>` | 🔑 Credential brute force (ssh, ftp, http-post) |

### Advanced Testing (NEW)

| Command | Description |
|---------|-------------|
| `/jwt <token>` | 🔐 JWT security testing - algorithm confusion, expiration, claims |
| `/ssrf <url>` | 🌐 SSRF testing - cloud metadata, internal services, protocol smuggling |
| `/xxe <endpoint>` | 📄 XXE testing - XML external entity injection |
| `/waf <url>` | 🛡️ WAF detection and fingerprinting |
| `/takeover <domain>` | 🎯 Subdomain takeover detection |
| `/params <url>` | 🔍 Hidden parameter discovery |
| `/secrets <domain>` | 🔑 Secret and credential scanning |
| `/graphql <endpoint>` | 📊 GraphQL security testing |

### Reconnaissance

| Command | Description |
|---------|-------------|
| `/subdomain <domain>` | 🔍 Subdomain enumeration (subfinder, crt.sh, DNS brute) |
| `/services <domain>` | 🔌 Third-party service detection (DNS, headers, JS) |
| `/cors <api_url>` | 🌐 CORS misconfiguration testing |
| `/endpoints <api_url>` | 🔎 API endpoint discovery with method testing |
| `/tools` | 🔧 Check tool availability and show install commands |

### Reporting

| Command | Description |
|---------|-------------|
| `/finding <severity> <title>` | 📝 Record a vulnerability finding |
| `/report` | 📊 Generate VAPT_REPORT.md |
| `/status` | 📈 Show engagement status |
| `/results [scan_name]` | 📋 Re-display scan results for LLM analysis |

## LLM Tools

The extension provides tools the LLM can call:

| Tool | Description |
|------|-------------|
| `record_finding` | Document a vulnerability with full details |
| `list_findings` | List all recorded findings |
| `run_command` | Execute an additional security command |
| `engagement_info` | Get engagement status |
| `generate_attack_variants` | Generate creative attack variants based on reconnaissance |
| `save_attack_variants` | Save generated variants to the engagement state |
| `list_attack_variants` | List all generated attack variants with full details |

## How It Works

```
┌─────────────────────────────────────────────────────────┐
│                    /redteam target.com                  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              Extension (index.ts)                       │
│                                                         │
│   execSync("nmap -sS -sV target.com")                  │
│   execSync("nikto -h http://target.com")               │
│   execSync("nuclei -u http://target.com")              │
│   execSync("gobuster dir -u http://target.com")        │
│                                                         │
│   (Tools run in parallel, output captured)              │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                      LLM Model                          │
│                                                         │
│   Receives: "Here are the scan results: ..."            │
│   Task: Analyze, identify vulns, call record_finding    │
│                                                         │
│   (Model only does analysis - no execution decisions)   │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    VAPT_REPORT.md                       │
└─────────────────────────────────────────────────────────┘
```

## Example Workflows

### AI-Driven Workflow (Recommended)

```bash
# 1. Start with AI analysis - generates attack variants
/redteam target.com

# LLM performs recon, detects tech stack, and generates attack variants

# 2. Review generated variants
/list-variants

# 3. Run automated tests from variants
/test-variants

# 4. Run specific tests based on tech stack
/jwt eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
/graphql https://api.target.com/graphql
/ssrf 'https://api.target.com/fetch?url='

# 5. Generate report
/report
```

### Traditional Workflow

```bash
# 1. Run reconnaissance and analysis
/redteam 192.168.1.100

# LLM analyzes results automatically and records findings

# 2. Run additional targeted scans based on LLM recommendations
/sqli "http://192.168.1.100/page.php?id=1"
/bruteforce 192.168.1.100 ssh
/waf http://192.168.1.100
/secrets 192.168.1.100

# 3. Check status
/status

# 4. Generate report
/report
```

### Advanced Testing Workflow

```bash
# JWT attacks
/jwt eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...

# SSRF with OOB detection
/ssrf 'https://api.target.com/webhook?url='

# XXE on XML endpoints
/xxe https://api.target.com/import

# GraphQL introspection and batching
/graphql https://api.target.com/graphql

# Subdomain takeover
/takeover target.com

# Secret scanning
/secrets target.com
```

## Required Tools

The extension expects these tools to be installed (standard on Kali Linux):

### Core Tools
- **Reconnaissance**: nmap, whatweb, dig, subfinder, httpx, dnsx
- **Vulnerability**: nikto, nuclei, sslscan, sslyze
- **Web**: gobuster, dirb, ffuf, curl, katana, arjun
- **Exploitation**: sqlmap, ysoserial
- **Credentials**: hydra, jwt_tool
- **OOB Testing**: interactsh-client
- **Secret Scanning**: gitleaks, trufflehog
- **WAF Detection**: wafw00f
- **Subdomain Takeover**: subjack

### Installation

**Debian/Ubuntu/Kali:**
```bash
sudo apt install nmap nikto gobuster dirb sqlmap hydra whatweb dnsutils ffuf sslscan

# Go-based tools (ProjectDiscovery)
go install github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest
go install github.com/projectdiscovery/httpx/cmd/httpx@latest
go install github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest
go install github.com/projectdiscovery/katana/cmd/katana@latest
go install github.com/projectdiscovery/interactsh/cmd/interactsh-client@latest
go install github.com/zricethezav/gitleaks/v8@latest
go install github.com/haccer/subjack@latest

# Python tools
pip install wafw00f sslyze pyjwt

# jwt_tool
git clone https://github.com/ticarpi/jwt_tool.git /opt/jwt_tool
pip install -r /opt/jwt_tool/requirements.txt
ln -s /opt/jwt_tool/jwt_tool.py /usr/local/bin/jwt_tool
```

**Using Vagrant (recommended):**
```bash
cd vagrant && vagrant up
vagrant ssh
check-tools  # Verify all tools are installed
```

## Findings Severity

| Level | Emoji | Description |
|-------|-------|-------------|
| Critical | 🔴 | Immediate exploitation possible, severe impact |
| High | 🟠 | Significant risk, should fix soon |
| Medium | 🟡 | Moderate risk, fix in normal cycle |
| Low | 🟢 | Minor issues, low priority |
| Info | ⚪ | Informational, no direct risk |

## File Structure

```
redteam/
├── index.ts              # Extension (direct execution + LLM analysis)
├── package.json          # Manifest
├── README.md             # This file
├── Vagrantfile           # VM setup with all tools pre-installed
├── agents/               # (Legacy - not used in direct execution mode)
├── docs/
│   └── PRD.md
└── skills/               # Reference skills for manual testing
    ├── active-directory/
    ├── metasploit/
    ├── password-attacks/
    ├── privilege-escalation/
    ├── reconnaissance/
    ├── vapt-report/
    └── web-exploitation/
```

## Attack Categories for AI Variant Generation

The AI can generate attack variants in these categories:

| Category | Description |
|----------|-------------|
| `authentication_bypass` | Login bypasses, session hijacking, token manipulation |
| `authorization_flaws` | IDOR, privilege escalation, role confusion |
| `injection_attacks` | SQLi, NoSQLi, command injection, template injection |
| `business_logic` | Race conditions, price manipulation, workflow bypasses |
| `api_security` | BOLA, BFLA, mass assignment, rate limiting |
| `file_handling` | Upload bypasses, path traversal, arbitrary file read |
| `cryptographic_issues` | Weak algorithms, key management, padding oracle |
| `information_disclosure` | Error messages, debug endpoints, stack traces |
| `ssrf_oob` | SSRF to cloud metadata, internal services, OOB callbacks |
| `deserialization` | Unsafe deserialization in Java, PHP, Python |
| `xxe` | XML external entity injection |
| `jwt_attacks` | Algorithm confusion, none algorithm, key leakage |
| `race_conditions` | TOCTOU, double-spend, concurrent request abuse |
| `cache_poisoning` | Web cache poisoning, CDN manipulation |
| `subdomain_takeover` | Dangling DNS records, unclaimed resources |
| `cors_misconfig` | Origin reflection, null origin, credentials with wildcard |
| `csp_bypass` | Content Security Policy bypasses |
| `prototype_pollution` | JavaScript prototype chain manipulation |
| `graphql_attacks` | Introspection, batching, nested queries, field enumeration |
| `websocket_attacks` | CSWSH, message manipulation, auth bypasses |

## Why This Architecture?

**Problem**: Models like Codex refuse to execute offensive security commands.

**Solution**: Don't ask the model to execute anything.
- The extension runs tools directly via `execSync`
- The model only sees output and provides analysis
- No security constraints triggered because the model isn't "hacking" - it's reading logs

This is both more reliable AND faster since tools run in parallel without waiting for LLM round-trips.
