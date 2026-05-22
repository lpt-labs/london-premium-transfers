// Pure-logic drift detector for the drift-check workflow.
//
// Given a list of scope globs (from a PR plan's "Scope (paths/files)" block)
// and a list of changed files (from `git diff --name-only`), reports which
// changed files fall outside the declared scope.
//
// Glob subset supported (intentionally small):
//   *            any characters within a single path segment (no `/`)
//   **           any characters including `/` (any number of segments)
//   **/          zero or more path segments, then continue matching
//   trailing /   directory; matches anything below that directory
//
// Anything else (`{`, `}`, `?`, `!`) is rejected with a clear error so the
// human simplifies the Scope rather than silently getting a wrong answer.
//
// I/O happens only when this file is invoked directly: it reads
// {"scope":string[],"changed":string[]} from stdin and writes
// {"extra":string[],"missingTouched":string[]} to stdout. Pure logic lives in
// `findDrift` so the test suite can call it without going through stdio.

import { fileURLToPath } from 'node:url';

export type DriftInput = { scope: string[]; changed: string[] };
export type DriftResult = { extra: string[]; missingTouched: string[] };

const UNSUPPORTED = /[{}?!]/;
const REGEX_META = new Set(['.', '+', '^', '$', '(', ')', '|', '[', ']', '\\']);

export function globToRegex(pattern: string): RegExp {
  if (UNSUPPORTED.test(pattern)) {
    throw new Error(
      `Unsupported glob character in "${pattern}". ` +
        `Supported: literal paths, *, **, trailing /. Rejected: { } ? !`,
    );
  }

  const isDir = pattern.endsWith('/');
  const body = isDir ? pattern.slice(0, -1) : pattern;

  let out = '';
  let i = 0;
  while (i < body.length) {
    const c = body[i];
    if (c === '*' && body[i + 1] === '*') {
      if (body[i + 2] === '/') {
        out += '(?:.*/)?';
        i += 3;
      } else {
        out += '.*';
        i += 2;
      }
    } else if (c === '*') {
      out += '[^/]*';
      i += 1;
    } else if (REGEX_META.has(c)) {
      out += '\\' + c;
      i += 1;
    } else {
      out += c;
      i += 1;
    }
  }

  if (isDir) {
    out += '/.*';
  }

  return new RegExp(`^${out}$`);
}

function isGlobPattern(pattern: string): boolean {
  return pattern.includes('*') || pattern.endsWith('/');
}

export function findDrift({ scope, changed }: DriftInput): DriftResult {
  const compiled = scope.map((raw) => ({ raw, re: globToRegex(raw) }));

  const extra = changed.filter(
    (file) => !compiled.some(({ re }) => re.test(file)),
  );

  const literalPaths = scope.filter((p) => !isGlobPattern(p));
  const changedSet = new Set(changed);
  const missingTouched = literalPaths.filter((p) => !changedSet.has(p));

  return { extra, missingTouched };
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks).toString('utf8');
}

async function main(): Promise<void> {
  const raw = await readStdin();
  const parsed = JSON.parse(raw) as Partial<DriftInput>;
  if (!Array.isArray(parsed.scope) || !Array.isArray(parsed.changed)) {
    throw new Error(
      'Input must be {"scope":string[],"changed":string[]} JSON on stdin',
    );
  }
  const result = findDrift({ scope: parsed.scope, changed: parsed.changed });
  process.stdout.write(JSON.stringify(result) + '\n');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err: unknown) => {
    const msg = err instanceof Error ? err.message : String(err);
    process.stderr.write(`check-drift: ${msg}\n`);
    process.exit(2);
  });
}
