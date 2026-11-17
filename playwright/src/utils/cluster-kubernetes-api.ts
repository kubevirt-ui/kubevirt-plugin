import fs from 'fs';
import http from 'http';
import https from 'https';
import { URL } from 'url';

import yaml from 'js-yaml';

import { resolveKubeconfig } from '@/utils/cluster-oc';
import { EnvVariables } from '@/utils/env-variables';

type KubeApiFetchInit = {
  body?: string;
  headers: Record<string, string>;
  method: string;
};

type KubeApiFetchResult = {
  ok: boolean;
  status: number;
  text: () => Promise<string>;
};

/**
 * Node built-in HTTP(S) fetch for kube API.
 * Avoids the `undici` package so CI still works after `git clean -fdx` / partial installs.
 */
function kubeApiFetch(
  url: string,
  init: KubeApiFetchInit,
  insecureSkipTlsVerify: boolean,
): Promise<KubeApiFetchResult> {
  return new Promise((resolve, reject) => {
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch (error) {
      reject(error);
      return;
    }

    const isHttps = parsed.protocol === 'https:';
    const transport = isHttps ? https : http;
    const headers = { ...init.headers };
    if (init.body !== undefined && headers['Content-Length'] === undefined) {
      headers['Content-Length'] = Buffer.byteLength(init.body).toString();
    }

    const request = transport.request(
      {
        hostname: parsed.hostname,
        method: init.method,
        path: `${parsed.pathname}${parsed.search}`,
        port: parsed.port || (isHttps ? 443 : 80),
        headers,
        ...(isHttps ? { rejectUnauthorized: !insecureSkipTlsVerify } : {}),
      },
      (response) => {
        const chunks: Buffer[] = [];
        response.on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });
        response.on('end', () => {
          const status = response.statusCode ?? 0;
          const body = Buffer.concat(chunks).toString('utf8');
          resolve({
            ok: status >= 200 && status < 300,
            status,
            text: async () => body,
          });
        });
      },
    );

    request.on('error', reject);
    if (init.body !== undefined) {
      request.write(init.body);
    }
    request.end();
  });
}

export interface ClusterApiAuth {
  insecureSkipTlsVerify: boolean;
  server: string;
  token: string;
}

interface KubeconfigDocument {
  clusters: Array<{
    cluster: { 'insecure-skip-tls-verify'?: boolean; server: string };
    name: string;
  }>;
  contexts: Array<{ context: { cluster: string; user: string }; name: string }>;
  users: Array<{ name: string; user: { token?: string } }>;
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
      insecureSkipTlsVerify: Boolean(cluster['insecure-skip-tls-verify']),
      server,
      token: user.token,
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
