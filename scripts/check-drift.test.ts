import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { findDrift } from './check-drift.ts';

describe('findDrift', () => {
  test('exact path match → no drift', () => {
    const result = findDrift({
      scope: ['app/page.tsx'],
      changed: ['app/page.tsx'],
    });
    assert.deepEqual(result, { extra: [], missingTouched: [] });
  });

  test('glob prefix — app/** matches app/page.tsx', () => {
    const result = findDrift({
      scope: ['app/**'],
      changed: ['app/page.tsx'],
    });
    assert.deepEqual(result.extra, []);
  });

  test('double-star recursion — app/** matches nested path', () => {
    const result = findDrift({
      scope: ['app/**'],
      changed: ['app/sub/dir/file.tsx'],
    });
    assert.deepEqual(result.extra, []);
  });

  test('zero-or-more segments — **/notes.md matches top-level and nested', () => {
    const result = findDrift({
      scope: ['**/notes.md'],
      changed: ['notes.md', 'docs/notes.md', 'a/b/c/notes.md'],
    });
    assert.deepEqual(result.extra, []);
  });

  test('trailing slash — app/ matches anything under app/', () => {
    const result = findDrift({
      scope: ['app/'],
      changed: ['app/page.tsx', 'app/foo/bar.ts'],
    });
    assert.deepEqual(result.extra, []);
  });

  test('single * does not cross /', () => {
    const result = findDrift({
      scope: ['app/*'],
      changed: ['app/page.tsx', 'app/sub/file.tsx'],
    });
    assert.deepEqual(result.extra, ['app/sub/file.tsx']);
  });

  test('regex meta in literal path is escaped (literal "." in filename)', () => {
    const result = findDrift({
      scope: ['docs/README.md'],
      changed: ['docs/READMExmd'],
    });
    assert.deepEqual(result.extra, ['docs/READMExmd']);
  });

  test('file touched but out of scope → drift', () => {
    const result = findDrift({
      scope: ['app/**'],
      changed: ['app/page.tsx', 'package.json'],
    });
    assert.deepEqual(result.extra, ['package.json']);
  });

  test('literal scope entry not touched → missingTouched (informational)', () => {
    const result = findDrift({
      scope: ['docs/WORKFLOWS.md', 'scripts/check-drift.ts'],
      changed: ['scripts/check-drift.ts'],
    });
    assert.deepEqual(result.missingTouched, ['docs/WORKFLOWS.md']);
    assert.deepEqual(result.extra, []);
  });

  test('glob scope entries are not considered for missingTouched', () => {
    const result = findDrift({
      scope: ['app/**', 'docs/'],
      changed: [],
    });
    assert.deepEqual(result.missingTouched, []);
  });

  test('empty scope + empty changed → empty results', () => {
    const result = findDrift({ scope: [], changed: [] });
    assert.deepEqual(result, { extra: [], missingTouched: [] });
  });

  test('empty scope + non-empty changed → everything is drift', () => {
    const result = findDrift({
      scope: [],
      changed: ['app/page.tsx', 'package.json'],
    });
    assert.deepEqual(result.extra, ['app/page.tsx', 'package.json']);
  });

  test('unsupported glob characters throw', () => {
    assert.throws(
      () => findDrift({ scope: ['app/{a,b}.ts'], changed: [] }),
      /Unsupported glob/,
    );
    assert.throws(
      () => findDrift({ scope: ['?app/**'], changed: [] }),
      /Unsupported glob/,
    );
    assert.throws(
      () => findDrift({ scope: ['!exclude.md'], changed: [] }),
      /Unsupported glob/,
    );
  });
});
