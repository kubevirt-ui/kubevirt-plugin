import fs from 'fs';

import yaml from 'js-yaml';
import { Agent, fetch as undiciFetch } from 'undici';

import { resolveKubeconfig } from '@/utils/cluster-oc';
import { EnvVariables } from '@/utils/env-variables';

/** Per-request TLS skip for clusters with `insecure-skip-tls-verify` (avoids NODE_TLS_REJECT_UNAUTHORIZED warnings). */
let insecureKubeApiAgent: Agent | undefined;

function kubeApiFetch(
  url: string,
  init: { body?: string; headers: Record<string, string>; method: string },
  insecureSkipTlsVerify: boolean,
): Promise<Awaited<ReturnType<typeof undiciFetch>>> {
  if (!insecureSkipTlsVerify) {
    return undiciFetch(url, init);
  }
  if (!insecureKubeApiAgent) {
    insecureKubeApiAgent = new Agent({ connect: { rejectUnauthorized: false } });
  }
  return undiciFetch(url, { ...init, dispatcher: insecureKubeApiAgent });
}

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

/** Bearer token + API server for cluster setup hooks (kubeadmin kubeconfig, not console session). */
export function resolveClusterApiAuth(kubeconfigPath?: string): ClusterApiAuth | undefined {
  const path = kubeconfigPath ?? resolveKubeconfig();
  if (!path) {
    return undefined;
  }
  const expected = EnvVariables.clusterUrl || undefined;
  const auth = resolveClusterApiAuthFromFile(path, expected);
  if (expected && !auth) {
    throw new Error(
      `No kubeconfig context for CLUSTER_URL (${normalizeClusterUrl(
        expected,
      )}) at ${path}. Re-run global setup with OPENSHIFT_PASSWORD (kubeadmin oc login).`,
    );
  }
  return auth ?? resolveClusterApiAuthFromFile(path);
}

export interface ClusterKubernetesResponse {
  ok: boolean;
  status: number;
  text: string;
}

/**
 * Direct Kubernetes API HTTP (bearer token from kubeconfig). Used instead of `oc` for setup hooks.
 */
export async function clusterKubernetesJson(
  method: string,
  apiPath: string,
  body?: unknown,
  extraHeaders?: Record<string, string>,
  kubeconfigPath?: string,
): Promise<ClusterKubernetesResponse> {
  const auth = resolveClusterApiAuth(kubeconfigPath);
  if (!auth) {
    throw new Error('Cluster API auth unavailable (kubeconfig token required)');
  }
  const path = apiPath.startsWith('/') ? apiPath : `/${apiPath}`;
  const url = `${auth.server}${path}`;
  const headers: Record<string, string> = {
    Accept: 'application/json',
    Authorization: `Bearer ${auth.token}`,
    ...extraHeaders,
  };
  if (body !== undefined && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await kubeApiFetch(
    url,
    {
      body: body === undefined ? undefined : JSON.stringify(body),
      headers,
      method,
    },
    auth.insecureSkipTlsVerify,
  );
  const text = await response.text();
  return { ok: response.ok, status: response.status, text };
}
