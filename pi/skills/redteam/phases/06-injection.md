# Phase 6: Injection and Input Handling

Test only candidate parameters/endpoints discovered earlier. SQLi validation stops at database enumeration; do not dump tables. XSS requires context and proof of execution or clearly unsafe reflection. SSRF requires URL-fetching candidate parameters; use interactsh/OOB and metadata checks only after SSRF is established. SSTI/XXE/deserialization/command injection require observed input format and safe payloads.
