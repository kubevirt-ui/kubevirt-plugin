/**
 * Configure kubeconfig for the cluster. Handles both IPI (file-based) and
 * ROKS (ibmcloud oc cluster config) paths.
 * Replaces: ci-scripts/hot-cluster/configure-kubeconfig.sh
 *
 * Required env: INFRASTRUCTURE_TYPE, CLUSTER_NAME, BASE_DOMAIN (for IPI)
 *               IC_KEY (for ROKS, via ibm-client)
 */

import { existsSync } from 'node:fs';
import { appendFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { execSync } from 'node:child_process';
import dns from 'node:dns/promises';

import { requireEnv } from '../kube-client';
import { getIamBearerToken, IKS_API_BASE } from '../ibm-client';

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

const main = async (): Promise<void> => {
  const infraType = requireEnv('INFRASTRUCTURE_TYPE');
  const clusterName = requireEnv('CLUSTER_NAME');

  if (infraType === 'ipi') {
    await configureIpi(clusterName);
  } else {
    await configureRoks(clusterName);
  }

  // Verify cluster connectivity
  console.log('Verifying cluster connectivity...');
  for (let i = 1; i <= 6; i++) {
    try {
      execSync('oc cluster-info', { stdio: 'pipe' });
      break;
    } catch {
      if (i === 6) {
        console.error('::error::Could not connect to cluster after DNS resolved');
        try {
          execSync('oc cluster-info', { stdio: 'inherit' });
        } catch { /* already logged */ }
        process.exit(1);
      }
      console.log(`  Retrying cluster connection... (${i}/6)`);
      await sleep(10000);
    }
  }

  execSync('oc get nodes -o wide', { stdio: 'inherit' });
};

const configureIpi = async (clusterName: string): Promise<void> => {
  const installDir = resolve(requireEnv('RUNNER_TEMP'), 'ipi-install');
  const kubeconfigPath = resolve(installDir, 'auth', 'kubeconfig');

  console.log(`Looking for kubeconfig at ${kubeconfigPath}...`);

  if (!existsSync(kubeconfigPath)) {
    console.error(`::error::kubeconfig not found at ${kubeconfigPath}`);
    process.exit(1);
  }

  process.env.KUBECONFIG = kubeconfigPath;
  const envFile = process.env.GITHUB_ENV;
  if (envFile) {
    appendFileSync(envFile, `KUBECONFIG=${kubeconfigPath}\n`);
  }

  const baseDomain = requireEnv('BASE_DOMAIN');
  const apiHost = `api.${clusterName}.${baseDomain}`;

  console.log('Waiting for API DNS to resolve (up to 10 minutes)...');
  for (let i = 1; i <= 20; i++) {
    try {
      const addrs = await dns.resolve4(apiHost);
      if (addrs.length > 0) {
        console.log(`  DNS resolved for ${apiHost}`);
        break;
      }
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOTFOUND' &&
          (err as NodeJS.ErrnoException).code !== 'ENODATA') {
        throw err;
      }
    }

    if (i === 20) {
      console.error(`::error::DNS for ${apiHost} did not resolve within 10 minutes`);
      process.exit(1);
    }
    console.log(`  Waiting for DNS resolution... (${i}/20)`);
    await sleep(30000);
  }
};

const configureRoks = async (clusterName: string): Promise<void> => {
  // For ROKS, use ibmcloud oc cluster config --admin
  // The IBM Cloud SDK can fetch the kubeconfig via REST API, but the CLI
  // also handles OIDC token setup and kubeconfig merging. Using the CLI
  // here since it's a one-time setup step and the ibmcloud binary is
  // pre-installed on the runner.
  execSync(`ibmcloud oc cluster config --cluster "${clusterName}" --admin`, {
    stdio: 'inherit',
  });
};

main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
