---
name: review-pr
description: Review a pull request against its plan. Flags scope creep, speculative abstraction, unverifiable success criteria, and hard-rule violations. Output is a structured review comment ready to post on the PR.
---

# Review a PR

Invoked when the user wants a structured review of an open pull request.

## Inputs

- A PR URL or number.
- Optionally: a specific concern to focus on (e.g. "check accessibility only").

## Steps

1. Fetch the PR's description and diff (use `gh pr view <n> --json title,body,files,additions,deletions` or `gh pr diff <n>`).
2. Locate the `## Plan` section in the PR description. If missing or empty, stop and report: "PR fails the `plan-gate` requirement — no Plan section in description."
3. Read [AGENTS.md](../../../AGENTS.md) and any path-scoped `CLAUDE.md` matching files in the diff.
4. Compare diff to plan along five axes:

   **Scope drift**
   - Files touched in the diff that aren't in the plan's *Scope*.
   - Files in *Scope* that aren't touched (incomplete?).

   **Surgical changes**
   - Any change unrelated to the stated goal? (Drive-by refactors, formatting passes, comment graffiti, dead-code removal that isn't part of the goal.)
   - Any new pattern that an existing repo file already provides?

   **Speculative abstraction**
   - Classes / interfaces / factories / hooks wrapping single use cases.
   - Generality added for hypothetical future requirements.
   - "Just in case" parameters or config options.

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
- **Reference line numbers** when possible (`file.ts:42`).
- **Distinguish blockers from optional.** Only mark as a blocker if merging would violate a hard rule, break the build, or fail an explicit success criterion.
- **No nitpicking style.** If a lint rule isn't catching it, it isn't a review issue. Reviewer covers judgment; lint covers mechanics.
- **No flattery.** Skip "great job" / "nice work" preambles. Strengths section lists specific things; if there are none, omit the section.
