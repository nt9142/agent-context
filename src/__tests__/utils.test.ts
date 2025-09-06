import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  ensureDir,
  pathExists,
  uniqueName,
  formatDate,
  computeAutoTarget,
} from '../utils.ts';
import * as fs from 'fs/promises';
import os from 'os';
import path from 'path';

let tmpRoot: string;

beforeEach(async () => {
  tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'agent-context-test-'));
});

afterEach(async () => {
  try {
    await fs.rm(tmpRoot, { recursive: true, force: true });
  } catch {
    // ignore
  }
});

describe('formatDate', () => {
  it('returns YYYYMMDD-HHMM format', () => {
    const s = formatDate();
    expect(s).toMatch(/^\d{8}-\d{4}$/);
  });
});

describe('computeAutoTarget', () => {
  it('uses agent-context by default', () => {
    const { baseDir, tempPath } = computeAutoTarget();
    expect(baseDir).toBe(path.join(os.homedir(), 'agent-context'));
    expect(tempPath.startsWith(baseDir)).toBe(true);
    expect(path.basename(tempPath)).toMatch(/^session-\d{8}-\d{4}$/);
  });

  it('accepts custom base directory name', () => {
    const { baseDir } = computeAutoTarget('my-scope');
    expect(baseDir).toBe(path.join(os.homedir(), 'my-scope'));
  });
});

describe('ensureDir & pathExists', () => {
  it('creates nested directories', async () => {
    const nested = path.join(tmpRoot, 'a/b/c');
    expect(await pathExists(nested)).toBe(false);
    await ensureDir(nested);
    expect(await pathExists(nested)).toBe(true);
  });
});

describe('uniqueName', () => {
  it('appends numeric suffix for existing names', async () => {
    const base = path.join(tmpRoot, 'projects');
    await ensureDir(base);
    const p1 = path.join(base, 'demo');
    await ensureDir(p1);

    const u1 = await uniqueName(base, 'demo');
    expect(u1).toBe('demo-1');
    await ensureDir(path.join(base, u1));

    const u2 = await uniqueName(base, 'demo');
    expect(u2).toBe('demo-2');
  });
});
