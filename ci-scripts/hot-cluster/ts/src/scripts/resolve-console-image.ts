/**
 * Resolve the off-cluster console image tag from the cluster's OpenShift version.
 * Replaces: ci-scripts/hot-cluster/resolve-console-image.sh
 *
 * Outputs: CONSOLE_IMAGE (to GITHUB_ENV if available, otherwise stdout)
 */

import { appendFileSync } from 'node:fs';

import { KubeClient } from '../kube-client';
import type { ClusterVersion } from '../types/openshift';

const REGISTRY = process.env.CONSOLE_IMAGE_REGISTRY ?? 'quay.io/openshift/origin-console';
const DEFAULT_TAG = process.env.CONSOLE_IMAGE_DEFAULT_TAG ?? 'latest';

const main = async (): Promise<void> => {
  if (process.env.CONSOLE_IMAGE) {
    console.error(`CONSOLE_IMAGE already set (${process.env.CONSOLE_IMAGE}); skipping.`);
    outputImage(process.env.CONSOLE_IMAGE);
    return;
  }

  if (process.env.CONSOLE_IMAGE_SKIP_DETECTION === 'true') {
    const image = `${REGISTRY}:${DEFAULT_TAG}`;
    console.error(`Auto-detection disabled; using ${image}`);
    outputImage(image);
    return;
  }

  const client = KubeClient.fromKubeconfig();

  let version: string | undefined;
  try {
    const cv = (await client.customObjects.getClusterCustomObject({
      group: 'config.openshift.io',
      version: 'v1',
      plural: 'clusterversions',
      name: 'version',
    })) as unknown as ClusterVersion;

    version = cv.status?.desired?.version;
  } catch {
    /* cluster version not available */
  }

  if (!version) {
    if (process.env.CI) {
      console.error('::error::Could not read ClusterVersion. Is this an OpenShift cluster?');
      process.exit(1);
    }
    const image = `${REGISTRY}:${DEFAULT_TAG}`;
    console.error(`Could not detect cluster version; falling back to ${image}`);
    outputImage(image);
    return;
  }

  const [major, minor] = version.split('.');
  if (!major || !minor) {
    if (process.env.CI) {
      console.error(`::error::Could not parse OpenShift version '${version}' as major.minor.*`);
      process.exit(1);
    }
    const image = `${REGISTRY}:${DEFAULT_TAG}`;
    console.error(`Could not parse version '${version}'; falling back to ${image}`);
    outputImage(image);
    return;
  }

  const tag = `${major}.${minor}`;
  const image = `${REGISTRY}:${tag}`;
  console.error(`Cluster OpenShift version: ${version} → console tag: ${tag}`);
  outputImage(image);

  const summaryFile = process.env.GITHUB_STEP_SUMMARY;
  if (summaryFile) {
    appendFileSync(
      summaryFile,
      [
        '### Off-cluster console image',
        '',
        `Cluster version: **${version}**`,
        `Console image: \`${image}\``,
        '',
      ].join('\n'),
    );
  }
};

const outputImage = (image: string): void => {
  const envFile = process.env.GITHUB_ENV;
  if (envFile) {
    appendFileSync(envFile, `CONSOLE_IMAGE=${image}\n`);
  }
  console.log(`CONSOLE_IMAGE=${image}`);
};

main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
