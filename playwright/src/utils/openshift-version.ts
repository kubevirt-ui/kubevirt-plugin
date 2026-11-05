import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Live OpenShift ClusterVersion major.minor (e.g. "4.13", "4.18").
 *
 * Prefer `oc get clusterversion` (same source as Allure). Fall back to
 * `OPENSHIFT_VERSION` (e.g. HC prepare `4.18_openshift`) when oc is unavailable.
 * Do not treat the release-branch name as the cluster version — HC clamps old
 * release plugins onto newer OCP (e.g. release-4.13 plugin on OCP 4.18).
 */
export function getOpenShiftMajorMinor(): string | null {
  const fromCluster = readClusterVersionMajorMinor();
  if (fromCluster) {
    return fromCluster;
  }
  return parseMajorMinor(process.env.OPENSHIFT_VERSION);
}

/** True when the live cluster is OpenShift `major.minor` (e.g. `4.13`). */
export function isOpenShiftMajorMinor(majorMinor: string): boolean {
  return getOpenShiftMajorMinor() === majorMinor;
}

function parseMajorMinor(version: string | undefined): string | null {
  if (!version) {
    return null;
  }
  const match = /^(\d+)\.(\d+)/.exec(version.trim());
  return match ? `${match[1]}.${match[2]}` : null;
}

function kubeconfigCandidates(): string[] {
  const candidates = [
    process.env.KUBECONFIG,
    path.join(process.cwd(), '.kubeconfigs', 'test-config'),
    path.join(process.cwd(), '.kubeconfigs', 'playwright-e2e-config'),
    '/tmp/kubeconfig',
  ].filter((p): p is string => Boolean(p));
  return [...new Set(candidates)];
}

function readClusterVersionMajorMinor(): string | null {
  for (const kube of kubeconfigCandidates()) {
    if (!fs.existsSync(kube)) {
      continue;
    }
    try {
      const raw = execSync(
        `KUBECONFIG="${kube}" oc get clusterversion version -o jsonpath='{.status.desired.version}'`,
        {
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'pipe'],
          timeout: 30_000,
        },
      ).trim();
      const parsed = parseMajorMinor(raw);
      if (parsed) {
        return parsed;
      }
    } catch {
      // try next kubeconfig / env fallback
    }
  }
  return null;
}
