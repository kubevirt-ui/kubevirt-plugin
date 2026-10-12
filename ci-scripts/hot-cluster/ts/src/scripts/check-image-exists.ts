/**
 * Check if a container image exists in a registry using the OCI distribution API.
 * Replaces: skopeo inspect docker://$IMAGE
 *
 * Env: KUBEVIRT_PLUGIN_IMAGE
 * Output: IMAGE_EXISTS=true|false
 */

import { appendFileSync } from 'node:fs';

import { requireEnv } from '../kube-client';

const main = async (): Promise<void> => {
  const image = requireEnv('KUBEVIRT_PLUGIN_IMAGE');

  // Parse image reference: registry/repo:tag
  const match = /^([^/]+)\/(.+):([^:]+)$/.exec(image);
  if (!match) {
    console.log(`Could not parse image reference: ${image}`);
    setOutput('IMAGE_EXISTS', 'false');
    return;
  }

  const [, registry, repo, tag] = match;

  const url = `https://${registry}/v2/${repo}/manifests/${tag}`;

  try {
    const res = await fetch(url, {
      headers: {
        Accept:
          'application/vnd.oci.image.manifest.v1+json, application/vnd.docker.distribution.manifest.v2+json',
      },
      method: 'HEAD',
    });

    if (res.ok) {
      console.log(`Image exists: ${image}`);
      setOutput('IMAGE_EXISTS', 'true');
    } else {
      console.log(`Image not found (status ${res.status}): ${image}`);
      setOutput('IMAGE_EXISTS', 'false');
    }
  } catch (err) {
    console.log(
      `Could not check image (${err instanceof Error ? err.message : String(err)}): ${image}`,
    );
    setOutput('IMAGE_EXISTS', 'false');
  }
};

const setOutput = (key: string, value: string): void => {
  const file = process.env.GITHUB_OUTPUT;
  if (file) {
    appendFileSync(file, `${key}=${value}\n`);
  }
  console.log(`${key}=${value}`);
};

void main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
