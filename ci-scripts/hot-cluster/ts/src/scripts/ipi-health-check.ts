/**
 * Manual health check for IPI clusters: DNS resolution + API /healthz probe.
 * Fails with exit 1 if DNS does not resolve.
 *
 * Required env: CLUSTER_NAME, BASE_DOMAIN
 */

import { execSync } from 'node:child_process';
import dns from 'node:dns/promises';

import { requireEnv } from '../kube-client';

const main = async (): Promise<void> => {
  const clusterName = requireEnv('CLUSTER_NAME');
  const baseDomain = requireEnv('BASE_DOMAIN');
  const apiHost = `api.${clusterName}.${baseDomain}`;

  console.log(`Probing IPI cluster via DNS: ${apiHost}...`);

  let apiIp: string;
  try {
    const addresses = await dns.resolve4(apiHost);
    if (addresses.length === 0) throw new Error('empty response');
    apiIp = addresses[0];
    console.log(`API DNS resolves — cluster is alive`);
    console.log(`  ${apiHost} -> ${apiIp}`);
  } catch {
    throw new Error(`API DNS does not resolve for ${apiHost}. Cluster may not exist.`);
  }

  console.log('Checking API reachability (HTTPS)...');
  try {
    const body = execSync(
      `curl -sk --connect-timeout 10 "https://${apiHost}:6443/healthz"`,
      { encoding: 'utf8' },
    );
    if (body.includes('ok')) {
      console.log('API server is healthy');
    } else {
      console.log('::warning::API server did not respond to /healthz — cluster may be initializing');
    }
  } catch {
    console.log('::warning::API server did not respond to /healthz — cluster may be initializing');
  }
};

main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
