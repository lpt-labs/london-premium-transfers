<!--
  DORMANT — this file does not execute in this repo today.

  This is a GitHub Agentic Workflow (gh-aw) source file. It is intentionally
  inert: gh-aw is not installed in this repo and no GitHub Copilot license is
  active, so nothing compiles this `.md` into the `.lock.yml` that GitHub
  Actions would actually run. GitHub Actions itself only consumes `.yml` /
  `.yaml` files in this directory, so an unaccompanied `.md` is invisible to
  the runner.

  The file lives here as a syntactically valid contract — a parity reference
  for the active Claude Code Routine documented at
  `docs/CLAUDE_ROUTINES/daily-repo-status.md`.

  Activation steps, frontmatter semantics, and the threat model are in
  `docs/COPILOT_STUDY/agentic-workflows.md`. Do not remove this comment
  without also flipping the file from dormant to active in that guide.
-->
---
description: Daily 24-hour repo activity digest with risks and recommended next steps.
on:
  schedule:
    - cron: "0 9 * * *"
permissions:
  contents: read
  issues: read
  pull-requests: read
tools:
  github:
    toolsets: [default]
safe-outputs:
  create-issue:
    title-prefix: "[repo-status] "
    labels:
      - report
---

# Daily repo status

Produce a concise 24-hour activity digest for `lpt-labs/london-premium-transfers`.

Cover:

- Recent issues, PRs, and commits in the last 24 hours.
- Key highlights and risks.
- Recommended next steps.

Link to the relevant issues, PRs, and commit SHAs inline. Keep the issue body short — bullet points, not prose.
