import path from "path";
import * as fs from "fs/promises";
import os from "os";

export async function ensureDir(p: string) {
  await fs.mkdir(p, { recursive: true });
}

export async function pathExists(p: string) {
  try {
    await fs.lstat(p);
    return true;
  } catch {
    return false;
  }
}

export async function uniqueName(targetDir: string, desired: string) {
  let candidate = desired;
  let i = 1;
  while (await pathExists(path.join(targetDir, candidate))) {
    candidate = `${desired}-${i++}`;
  }
  return candidate;
}

export function formatDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${year}${month}${day}-${hours}${minutes}`;
}

export function computeAutoTarget(baseDirName = "agent-context") {
  const baseDir = path.join(os.homedir(), baseDirName);
  const tempName = `session-${formatDate()}`;
  const tempPath = path.join(baseDir, tempName);
  return { baseDir, tempPath };
}
