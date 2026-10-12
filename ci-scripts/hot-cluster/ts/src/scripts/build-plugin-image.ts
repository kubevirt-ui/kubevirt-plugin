/**
 * Build a per-instance kubevirt-plugin image in-cluster via
 * setup-plugin-image.sh, capturing the IMAGE_REF output.
 * Shared by deploy-manual-console.yml and deploy-plugin.yml.
 *
 * Env: INSTANCE_KEY, MANUAL_CONSOLE_NS, GITHUB_WORKSPACE
 */

import { execSync } from 'node:child_process';
import { readFileSync, unlinkSync } from 'node:fs';

import { requireEnv } from '../kube-client';
import { setOutput } from '../utils';

const main = async (): Promise<void> => {
  const instanceKey = requireEnv('INSTANCE_KEY');
  const manualConsoleNs = requireEnv('MANUAL_CONSOLE_NS');
  const workspace = requireEnv('GITHUB_WORKSPACE');

  const env: NodeJS.ProcessEnv = {
    ...process.env,
    BUILD_DIR: `${workspace}/plugin-src`,
    IMAGE_NAME: `kubevirt-plugin-${instanceKey}`,
    NS: manualConsoleNs,
  };

  const outputFile = execSync('mktemp', { encoding: 'utf8' }).trim();

  try {
    execSync(`bash ci-scripts/manual-console/images/setup-plugin-image.sh | tee "${outputFile}"`, {
      cwd: workspace,
      env,
      stdio: 'inherit',
    });

    const content = readFileSync(outputFile, 'utf8');
    const match = /^IMAGE_REF=(.+)$/m.exec(content);
    if (!match?.[1]) {
      console.error('::error::setup-plugin-image.sh did not output IMAGE_REF=');
      process.exit(1);
    }

    setOutput('image', match[1]);
  } finally {
    try {
      unlinkSync(outputFile);
    } catch {
      /* best effort */
    }
  }
};

void main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
