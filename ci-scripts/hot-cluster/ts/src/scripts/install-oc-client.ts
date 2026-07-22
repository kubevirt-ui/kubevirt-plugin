/**
 * Download and install the OpenShift oc client binary.
 * Replaces: ci-scripts/hot-cluster/install-oc-client.sh
 *
 * Env: OPENSHIFT_VERSION, CLUSTER_JSON (optional), OC_INSTALL_DIR
 */

import { createWriteStream, mkdirSync, chmodSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execSync } from 'node:child_process';
import { pipeline } from 'node:stream/promises';

import { requireEnv } from '../kube-client';

const main = async (): Promise<void> => {
  const installDir = process.env.OC_INSTALL_DIR ?? '/usr/local/bin';

  let version = process.env.OPENSHIFT_VERSION ?? '';

  if (!version && process.env.CLUSTER_JSON) {
    try {
      const json = JSON.parse(process.env.CLUSTER_JSON);
      const raw = json.masterKubeVersion ?? json.openshiftVersion ?? json.version ?? '';
      if (raw) {
        const parts = raw.split('.');
        version = `${parts[0]}.${parts[1]}`;
      }
    } catch {
      /* ignore */
    }
  }

  version = version || '4.20';
  console.log(`Installing oc client for OpenShift ${version}...`);

  const tmpDir = join(tmpdir(), `oc-install-${Date.now()}`);
  mkdirSync(tmpDir, { recursive: true });

  const archivePath = join(tmpDir, 'openshift-client-linux.tar.gz');
  const url = `https://mirror.openshift.com/pub/openshift-v4/clients/ocp/stable-${version}/openshift-client-linux.tar.gz`;

  const response = await fetch(url);
  if (!response.ok || !response.body) {
    console.error(`::error::Failed to download oc from ${url} (status: ${response.status})`);
    process.exit(1);
  }

  const fileStream = createWriteStream(archivePath);
  await pipeline(response.body as unknown as NodeJS.ReadableStream, fileStream);

  execSync(`tar -xzf "${archivePath}" -C "${tmpDir}"`);
  execSync(`install -m 0755 "${join(tmpDir, 'oc')}" "${join(installDir, 'oc')}"`);

  const clientVersion = execSync(`"${join(installDir, 'oc')}" version --client`, {
    encoding: 'utf8',
  }).trim();
  console.log(`Installed: ${clientVersion}`);

  execSync(`rm -rf "${tmpDir}"`);
};

main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
