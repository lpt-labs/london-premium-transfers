# Copilot Content Exclusions — Admin Walkthrough

> **Why this file exists.** Part of the Copilot governance study guides for this repo. Covers what content exclusions actually do (and don't do), how to configure them at org and repo level, and what the developer sees when an exclusion fires.
>
> Read alongside [`org-policies.md`](org-policies.md) (master toggle that gates exclusions entirely) and [`audit-log.md`](audit-log.md) (where exclusion-block events appear).

---

## Purpose

Content exclusions tell Copilot to **ignore matched files** when generating suggestions. The use case is keeping sensitive content — credentials, customer data, proprietary algorithms — out of Copilot's suggestion pipeline.

The control is **opt-in**: by default Copilot considers every file the developer has open. You add exclusion patterns to carve out the files (or whole directories) that should be invisible to it.

---

## What content exclusions actually do

This is the part most readers get wrong on first reading. The exclusion is **about suggestions**, not file access:

| Capability | With exclusion match | Without exclusion match |
| --- | --- | --- |
| Developer can open, read, edit the file in their IDE | ✅ Yes | ✅ Yes |
| File contents appear in chat context when the developer pastes them | ✅ Yes (Copilot can't block paste) | ✅ Yes |
| Copilot reads the file to compute inline suggestions | ❌ No | ✅ Yes |
| Copilot reads the file as context for other files' suggestions | ❌ No | ✅ Yes |
| Copilot generates a suggestion *into* the file | ❌ No — the file is suggestion-frozen | ✅ Yes |
| File content is sent to Copilot Chat | ❌ Skipped from context | ✅ Yes |

The shorthand:

> Content exclusions are **"Copilot won't suggest from or into this file"**.
> They are **NOT "Copilot can't read this file"** — the developer can still open and edit it, and a careless paste of its contents into a chat box would still leak it.

This boundary matters for compliance reviews: exclusions reduce the surface area of accidental ingestion, but they are not a DLP control.

---

## Pattern syntax

Exclusions are **glob patterns** evaluated against the repo-relative path of each file. A subset of `.gitignore`-style globbing:

| Pattern | Matches |
| --- | --- |
| `secrets/**` | Everything under `secrets/` at any depth |
| `**/*.pem` | Any `.pem` file anywhere in the repo |
| `config/prod.json` | Exactly that path |
| `*.lock` | Any top-level `.lock` file (does **not** descend into subdirs without `**/`) |
| `!docs/example.pem` | Negation — re-include a file that an earlier pattern would have excluded |

Patterns are case-sensitive. Whitespace and comments (`#`) are stripped before matching.

---

## UI Path

```
github.com
└── Your profile picture → Organizations
    └── <your-org>
        └── Settings
            └── Copilot (sidebar)
                └── Content exclusions
                    ├── Repository exclusions ← per-repo rules
                    └── Organization exclusions ← org-wide rules
```

Repo-level exclusions can also be configured by repo admins under **Repo → Settings → Copilot → Content exclusions**. Org-level rules are additive to repo-level ones — both fire if both match.

---

## Step-by-Step: add an exclusion

### Org level (applies to every repo in the org)

1. github.com → your profile picture → **Your organizations** → org name.
2. **Settings** → **Copilot** → **Content exclusions**.
3. Under **Organization exclusions**, click **Add a new exclusion**.
4. Paste glob patterns, one per line. Use `#` for comments.
5. Click **Save**.

### Repo level (applies to one repo)

1. Open the repo on github.com.
2. **Settings** → **Copilot** → **Content exclusions**.
3. Under **Repository exclusions**, click **Add a new exclusion**.
4. Paste patterns, one per line.
5. Click **Save**.

In both cases the audit log gets a `copilot.content_exclusion.*` entry — see [`audit-log.md`](audit-log.md) for the filter syntax.

The change propagates to active IDE sessions within ~30 minutes; force-restart Copilot in the IDE if you need it sooner.

---

## What developers see when an exclusion fires

The signals vary by IDE, but the shape is consistent: **silent skip + status-bar indicator**.

| Surface | What appears |
| --- | --- |
| Inline ghost text | Simply does not appear in matched files; no error popup |
| Copilot status-bar icon (VS Code) | Shows a "disabled" or "exclusion" badge; hover text reads e.g. *"Copilot is disabled for this file. The file is included in your organization's content exclusion settings."* |
| Copilot Chat in IDE | When the developer asks about the excluded file, Chat returns *"I can't provide suggestions for this file because it matches a content-exclusion policy."* or similar — wording varies between releases |
| Copilot Chat on github.com | Same shape: the assistant declines and names the policy |
| Coding agent runs | Excluded files are omitted from the agent's context; agent logs include a line like `skipped <path>: content exclusion` |

Crucially, the IDE does **not** put up a modal or block the file from opening. A developer can finish what they're doing — Copilot just won't help.

---

## Common patterns to exclude

The choices are repo-specific, but typical candidates:

| Pattern | Why |
| --- | --- |
| `secrets/**`, `**/secret*`, `**/*.pem`, `**/*.key`, `.env*` | Credentials and key material — the canonical case |
| Customer data fixtures | Avoid Copilot suggesting recognisable PII back into other files |
| Proprietary algorithm files | Reduce accidental ingestion of code that is not open-licensable |
| Auto-generated lock files | Optional — not a security concern, but excluding them keeps Copilot from suggesting lockfile edits |
| Vendored copies of third-party code | Avoid Copilot suggesting based on third-party patterns the repo doesn't own |

### What this repo currently excludes

**None.** This repo has no content exclusions configured. Justification:

- No checked-in secrets or credentials (verified by [path-guard's protected paths](../../.github/workflows/path-guard.yml) + standard `.gitignore` for `.env.local`).
- No customer-data fixtures (the project doesn't have a database yet).
- All source code is intended to be Copilot-readable for development assistance.

If we later add a secrets directory or PII fixtures, this section is the first place to update. Match the addition with an org-level exclusion (so other repos in the org benefit) and an audit-log screenshot in the PR.

---

## Expected Behaviour

| Scenario | What happens |
| --- | --- |
| Developer opens an excluded file | File opens normally; Copilot suggestions silent; status bar shows exclusion |
| Developer pastes excluded file contents into chat | Copilot may still process the paste (exclusions match files, not paste payloads) |
| Pattern syntax has a typo | The rule is saved as-is; matches nothing; verify with the audit log |
| Org and repo both exclude the same path | One block event per developer interaction; no double-counting |
| Exclusion removed | New suggestions for the path start appearing within ~30 min; existing IDE sessions may need a Copilot restart |

---

*Source: [GitHub Docs — Excluding content from Copilot](https://docs.github.com/en/copilot/managing-copilot/configuring-and-auditing-content-exclusion/excluding-content-from-github-copilot) (verified May 2026). Pattern syntax and UI labels are current as of that date; verify against the live docs if a specific glob behaviour matters for a compliance question.*
