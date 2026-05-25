# Copilot CLI in a GitHub Actions workflow

This guide covers the `.github/workflows/cli-agent-task.yml` file added in PR 13. That file is **dormant** — it will not run in CI because no GitHub Copilot CLI license is active in this repo. Its purpose is to be a syntactically-valid reference for the CLI invocation pattern so a future operator can activate it by adding the license and removing the short-circuit guard.

The active equivalent in this repo is the `@claude` mention trigger in `.github/workflows/claude.yml`. Both patterns solve the same problem — "an AI agent reads an issue and opens a PR" — but they come from different ecosystems.

---

## 1. Line-by-line YAML walkthrough

```yaml
# DORMANT — Copilot CLI is not active in this repo; file exists as a syntactic
# reference for the CLI invocation pattern.
# See docs/COPILOT_STUDY/cli-in-workflow.md for activation context.
name: CLI agent task (dormant)
```

The top-of-file comment is load-bearing: it tells any human (or agent) who opens this file why it exists and where to learn more before touching it.

```yaml
on:
  workflow_dispatch:
    inputs:
      issue:
        description: "GitHub issue number to action"
        required: true
        type: string
```

`workflow_dispatch` means this workflow only runs when someone manually presses "Run workflow" in the GitHub Actions UI or calls the Dispatch API. It never fires automatically on pull-request events or pushes. The `issue` input captures which issue the CLI agent should work on.

```yaml
jobs:
  cli-task:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
```

Least-privilege: only the two scopes the CLI agent needs to create a branch and open a PR. No `id-token`, no `packages`, nothing extra.

```yaml
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: "lts/*"
```

First-party actions (`actions/*`) may use `@v6` major-version tags per the repo's workflow rules. Third-party actions would need pinning to a 40-char commit SHA.

```yaml
      - name: Validate issue input
        run: |
          ISSUE="$INPUT_ISSUE"
          if ! [[ "$ISSUE" =~ ^[0-9]+$ ]]; then
            echo "::error::issue input must be a numeric GitHub issue number"
            exit 1
          fi
        env:
          INPUT_ISSUE: ${{ inputs.issue }}
```

PR-author-controlled values — here `inputs.issue`, which comes from whoever clicked "Run workflow" — flow through `env:` and are referenced as `"$VAR"` in the shell script, never `${{ inputs.issue }}` directly inside the `run:` block. This prevents command-injection: a value like `0; rm -rf /` in `inputs.issue` would be passed as a literal string to the env var, not interpolated into the shell command.

```yaml
      - name: Run Copilot CLI (dormant — short-circuits if no license)
        run: |
          if [ "${COPILOT_LICENSED:-false}" = "true" ]; then
            npx @github/copilot-cli agent \
              -p "Action GitHub issue #${INPUT_ISSUE}: read the issue body, implement the requested change, open a PR." \
              --no-ask-user
          else
            echo "::notice::Dormant: Copilot CLI not licensed in CI. Set COPILOT_LICENSED=true to activate."
          fi
        env:
          COPILOT_GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          COPILOT_LICENSED: ${{ vars.COPILOT_LICENSED || 'false' }}
          INPUT_ISSUE: ${{ inputs.issue }}
```

This is the core step. When the license guard is satisfied, `npx @github/copilot-cli agent` spins up the Copilot CLI agent inside the runner. Without a license, it short-circuits with a `::notice` annotation (visible in the Actions UI) and exits 0 so the run doesn't appear red.

---

## 2. `COPILOT_GITHUB_TOKEN` semantics and the chain-of-workflows gotcha

The CLI step passes `COPILOT_GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}`. The Copilot CLI reads this env var to authenticate its GitHub API calls — creating a branch, pushing commits, opening a PR.

`secrets.GITHUB_TOKEN` is a short-lived token scoped to the current workflow run. It has one important security property: **events triggered by this token do not fire downstream workflows**. GitHub intentionally breaks the recursive-trigger chain so that a bot-opened PR cannot automatically trigger another bot that triggers another bot, ad infinitum.

In practice this means: if the Copilot CLI agent creates a PR using `GITHUB_TOKEN`, the `plan-gate` and `agent-ci` workflows will **not** automatically run on that PR. A human must push an empty commit or manually re-trigger the checks.

The fix, when the chain matters, is to use a **GitHub App installation token** instead. App tokens are issued to an App identity (not the `github-actions[bot]` machine account), and GitHub does not apply the anti-recursion rule to App tokens by default. This is exactly how the `@claude` trigger works in `.github/workflows/claude.yml` — it uses the `ANTHROPIC_API_KEY` and the Claude Code GitHub App, which operates under an App identity that downstream workflows recognise as a real actor.

For more on the GITHUB_TOKEN recursion rule and the App-token workaround, see `docs/AGENT_PLAYBOOK.md` "GitHub token semantics" section.

---

## 3. `--no-ask-user` behaviour

The `--no-ask-user` flag tells the Copilot CLI agent to proceed through all decision points without prompting for human confirmation. On an interactive terminal this flag would be omitted — the agent pauses and asks "should I create this file?" before acting. In a CI runner there is no terminal to prompt, so `--no-ask-user` is required for the command to complete. Think of it as the headless-browser equivalent of `--headless` — same tool, non-interactive mode.

The tradeoff is that the agent will make judgment calls autonomously. If the prompt is ambiguous or the issue body is underspecified, the agent may produce a PR that doesn't match the intent. This is why the issue body should be explicit about the expected output.

---

## 4. Expected PR outcome

When the workflow runs with a valid license, the Copilot CLI agent will:

1. Read the issue body via the GitHub API.
2. Clone the repo (via `actions/checkout`), create a new branch (`copilot/issue-<N>` or similar).
3. Implement the requested change — new files, edits, whatever the issue describes.
4. Push the branch and open a PR against `main`.

The resulting PR goes through exactly the same CI as a human-authored PR: `plan-gate` checks for a `## Plan` section, `agent-ci` lints and typechecks, `drift-check` compares the changed files against the scope declared in the plan. The agent is responsible for writing a well-formed plan in the PR description.

One practical implication of the `GITHUB_TOKEN` gotcha above: those CI checks may not auto-trigger on the bot-opened PR. A workaround is to configure the workflow to use a PAT or App installation token with sufficient scope, or for the human reviewer to push an empty commit to kick the checks.

---

## 5. Comparison to the `@claude` trigger

The `@claude` mention in a GitHub issue or PR comment triggers `.github/workflows/claude.yml`. That workflow uses the Claude Code GitHub App (an Anthropic-hosted App with an App installation token) to run the requested task, commit to a branch, open a PR, and post a status comment.

The intent is identical to what the Copilot CLI workflow would do: read a task from an issue, produce a branch + PR. The key differences:

| Dimension | Copilot CLI (`cli-agent-task.yml`) | Claude Code GitHub App (`claude.yml`) |
|---|---|---|
| Trigger | Manual `workflow_dispatch` with `issue` input | `@claude` mention in any issue/PR comment |
| AI model | GitHub Copilot (OpenAI-based) | Claude (Anthropic) |
| Token used | `secrets.GITHUB_TOKEN` (recursion-blocked) | App installation token (recursion-allowed) |
| Status | Dormant — no license in this repo | **Active** — the primary agentic path |
| Downstream CI | May not auto-trigger on bot PR | Auto-triggers on bot PR (App token) |

The dormant file exists so there is a concrete syntactic reference for the CLI invocation pattern. If a Copilot CLI license is added in future, the activation path is: remove the `COPILOT_LICENSED` guard, set `vars.COPILOT_LICENSED = true`, and replace `secrets.GITHUB_TOKEN` with an App installation token to restore the downstream-trigger behaviour.
