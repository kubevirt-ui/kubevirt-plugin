/**
 * Cluster CPU architecture for Playwright (CI sets `ARCH`, e.g. `s390x` / `x86_64`).
 * Matches kubevirt-ui `template-constants` / gating patterns (release-4.21).
 */

export type ClusterArchitecture = 's390x' | 'x86_64' | string;

export function getClusterArchitecture(): ClusterArchitecture {
  return process.env.ARCH || 'x86_64';
}

export function isS390xArchitecture(architecture?: string): boolean {
  return (architecture ?? getClusterArchitecture()) === 's390x';
}

/**
 * Common templates on s390x ship with a `-s390x` metadata-name suffix.
 * Windows template names are not suffixed (same as kubevirt-ui).
 */
export function getTemplateMetadataName(baseName: string, architecture?: string): string {
  if (isS390xArchitecture(architecture)) {
    return baseName.endsWith('-s390x') ? baseName : `${baseName}-s390x`;
  }
  return baseName;
}
