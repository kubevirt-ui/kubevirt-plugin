import fs from 'fs';

import yaml from 'js-yaml';

import { resolveKubeconfig } from '@/utils/cluster-oc';
import { EnvVariables } from '@/utils/env-variables';

export interface ClusterApiAuth {
  server: string;
  token: string;
  insecureSkipTlsVerify: boolean;
}

interface KubeconfigDocument {
  clusters: Array<{
    name: string;
    cluster: { server: string; 'insecure-skip-tls-verify'?: boolean };
  }>;
  users: Array<{ name: string; user: { token?: string } }>;
  contexts: Array<{ name: string; context: { cluster: string; user: string } }>;
}

export function normalizeClusterUrl(url: string): string {
  return url.replace(/\/$/, '');
}

/** True when the kubeconfig has a context whose API server matches `clusterUrl`. */
export function kubeconfigMatchesClusterUrl(kubeconfigPath: string, clusterUrl: string): boolean {
  return resolveClusterApiAuthFromFile(kubeconfigPath, clusterUrl) !== undefined;
}

function resolveClusterApiAuthFromFile(
  kubeconfigPath: string,
  expectedClusterUrl?: string,
): ClusterApiAuth | undefined {
  const doc = yaml.load(fs.readFileSync(kubeconfigPath, 'utf8')) as KubeconfigDocument;
  const expected = expectedClusterUrl ? normalizeClusterUrl(expectedClusterUrl) : undefined;

  for (const { context } of doc.contexts ?? []) {
    const cluster = doc.clusters?.find((c) => c.name === context.cluster)?.cluster;
    const user = doc.users?.find((u) => u.name === context.user)?.user;
    if (!cluster?.server || !user?.token) {
      continue;
    }
    const server = normalizeClusterUrl(cluster.server);
    if (expected && server !== expected) {
      continue;
    }
    return {
      server,
      token: user.token,
      insecureSkipTlsVerify: Boolean(cluster['insecure-skip-tls-verify']),
    };
  }
  return undefined;
}

/** Bearer token + API server for NAD cluster API calls (kubeconfig, not `oc`). */
export function resolveClusterApiAuth(): ClusterApiAuth | undefined {
  const kubeconfigPath = resolveKubeconfig();
  if (!kubeconfigPath) {
    return undefined;
  }
  const expected = EnvVariables.clusterUrl || undefined;
  const auth = resolveClusterApiAuthFromFile(kubeconfigPath, expected);
  if (expected && !auth) {
    throw new Error(
      `No kubeconfig context for CLUSTER_URL (${normalizeClusterUrl(
        expected,
      )}). Re-run global setup (do not reuse a kubeconfig from another cluster).`,
    );
  }
  return auth ?? resolveClusterApiAuthFromFile(kubeconfigPath);
}
