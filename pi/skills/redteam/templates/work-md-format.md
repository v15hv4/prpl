# work.md Append-only Format

`work.md` is an immutable audit trail. Never edit prior entries. Every event is appended:

```markdown
## {ISO timestamp} — {event title}
- Phase: {phase id/name if relevant}
- Tool/output/finding reference
- Rationale, branch decision, or blocker
```

Record session init, plan request, plan produced, tool completion/gather, inference, candidates, findings, phase status changes, resume events, and report generation. Secrets must be redacted.
