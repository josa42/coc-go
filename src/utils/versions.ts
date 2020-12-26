export type version = [number, number, number];

const versionExp = /^v?(\d+)\.(\d+).(\d+)$/;

export function isValidVersion(version: string): boolean {
  return Boolean(version.trim().match(versionExp));
}

export function compareVersions(version1: string, version2: string): number {
  const v1 = parseVersion(version1);
  const v2 = parseVersion(version2);

  for (let i = 0; i < 3; i++) {
    if (v1[i] !== v2[i]) {
      return Math.max(-1, Math.min(1, v1[i] - v2[i]));
    }
  }

  return 0;
}

export function parseVersion(v: string): version {
  let ver: version = [0, 0, 0];
  const match = v.trim().match(versionExp);

  if (match) {
    const [, major, minor, patch] = match;
    ver = [parseInt(major), parseInt(minor), parseInt(patch)];
  }

  if (!isValidVersion(v)) {
    throw new Error(`'${v}' is not a valid version`);
  }

  return ver;
}
