---
agent: ask
description: Review a pull request against its plan. Applies the surgical-changes lens — flags scope creep, speculative abstraction, and unverifiable success criteria.
---

You are reviewing an open pull request in `london-premium-transfers`. Your output is a structured review comment the human reviewer can post (or refine) on the PR.

## Inputs you will be given

- The PR URL or number.
- Optionally: a specific concern to focus on (e.g. "check accessibility only").

## Steps

1. Fetch the PR's description and diff.
2. Locate the `## Plan` section in the PR description. If missing, stop and report that the PR fails the `plan-gate` requirement.
3. Read [`AGENTS.md`](../../AGENTS.md), [`.github/copilot-instructions.md`](../copilot-instructions.md), and any path-scoped `.github/instructions/*.instructions.md` matching files in the diff.
4. Compare diff to plan along these axes:

   **Scope drift**
   - Files touched in the diff that aren't in the plan's *Scope*.
   - Files in *Scope* that aren't touched (incomplete?).

   **Surgical changes**
   - Any change unrelated to the stated goal? (Drive-by refactors, formatting passes, comment graffiti.)
   - Any new file or pattern that an existing repo file already provides?

   **Speculative abstraction**
   - Classes/interfaces/factories wrapping single use cases.
   - Generality added for hypothetical future cases.

   **Verifiable success criteria**
   - Each criterion in the plan — is it checkable from the diff or a workflow run? Flag any that aren't.
   - Are all criteria addressed by the diff?

   **Hard-rule violations**
   - Secrets in committed files.
   - Edits to `.github/workflows/**`, `.github/actions/**`, `package.json`, `pnpm-lock.yaml`, `next.config.ts` without an `infra-change` label.
   - Artifacts uploaded without `${{ github.run_id }}-${{ github.sha }}` in the name.

5. Output the review in this shape:

```md
## Review

### Strengths
- <thing the PR did well>

### Concerns
- **<category>** <file:line>: <issue>. *Suggested:* <what to change>.

### Blockers (must fix before merge)
- <each item>

### Optional improvements
- <each item>

### Plan alignment
- Scope drift: <none | list>
- Success criteria addressed: <count>/<total>
```

## Output discipline

- **One bullet per issue.** Don't combine.
- **Reference line numbers** when possible.
- **Distinguish blockers from optional**. Only mark as a blocker if merging would violate a hard rule, break the build, or fail an explicit success criterion.
- **No nitpicking style.** If a lint rule isn't catching it, it isn't a review issue.
