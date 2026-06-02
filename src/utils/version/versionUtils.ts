export type VersionMajorMinor = {
  major: number;
  minor: number;
};

/**
 * Parses a version string (e.g. "4.21.0", "v5.1.0-rc.1") into major/minor components.
 * Accepts formats: "major.minor[.patch][-prerelease]" with optional "v" prefix.
 * @param version - version string to parse
 */
export const parseVersionMajorMinor = (version: string | undefined): null | VersionMajorMinor => {
  if (!version || typeof version !== 'string') return null;
  const match = /^v?(\d+)\.(\d+)/i.exec(version.trim());
  if (!match) return null;
  const major = Number.parseInt(match[1], 10);
  const minor = Number.parseInt(match[2], 10);
  if (!Number.isFinite(major) || !Number.isFinite(minor)) return null;
  return { major, minor };
};

/**
 * Returns true when the parsed version meets or exceeds the given threshold.
 * Compares major first, then minor. Returns false for unparseable/missing input.
 * @param version - version string to compare
 * @param minVersion - minimum version threshold
 */
export const versionMeetsMajorMinorThreshold = (
  version: string | undefined,
  minVersion: VersionMajorMinor,
): boolean => {
  const parsed = parseVersionMajorMinor(version);
  if (parsed == null) return false;
  if (parsed.major > minVersion.major) return true;
  if (parsed.major < minVersion.major) return false;
  return parsed.minor >= minVersion.minor;
};
