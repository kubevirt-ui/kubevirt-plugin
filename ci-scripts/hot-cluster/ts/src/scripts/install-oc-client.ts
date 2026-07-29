/**
 * Download and install the OpenShift oc client binary.
 * Replaces: ci-scripts/hot-cluster/install-oc-client.sh
 *
 * Env: OPENSHIFT_VERSION, CLUSTER_JSON (optional), OC_INSTALL_DIR
 */

import { execSync } from 'node:child_process';
import { createWriteStream, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pipeline } from 'node:stream/promises';

const main = async (): Promise<void> => {
  const installDir = process.env.OC_INSTALL_DIR ?? '/usr/local/bin';

  const version = ((): string => {
    const envVersion = process.env.OPENSHIFT_VERSION ?? '';
    if (envVersion) {
      return envVersion;
    }
    if (process.env.CLUSTER_JSON) {
      try {
        const json = JSON.parse(process.env.CLUSTER_JSON) as Record<string, string>;
        const raw: string = json.masterKubeVersion ?? json.openshiftVersion ?? json.version ?? '';
        if (raw) {
          const parts: string[] = raw.split('.');
          return `${parts[0]}.${parts[1]}`;
        }
      } catch {
        /* ignore */
      }
    }
    return '4.20';
  })();
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

void main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
