/**
 * Build a per-instance kubevirt-plugin image in-cluster via
 * setup-plugin-image.sh, capturing the IMAGE_REF output.
 * Shared by deploy-manual-console.yml and deploy-plugin.yml.
 *
 * Env: INSTANCE_KEY, MANUAL_CONSOLE_NS, GITHUB_WORKSPACE
 */

import { execSync } from 'node:child_process';
import { appendFileSync, readFileSync, unlinkSync } from 'node:fs';

import { requireEnv } from '../kube-client';

const main = (): void => {
  const instanceKey = requireEnv('INSTANCE_KEY');
  const manualConsoleNs = requireEnv('MANUAL_CONSOLE_NS');
  const workspace = requireEnv('GITHUB_WORKSPACE');

  const env: NodeJS.ProcessEnv = {
    ...process.env,
    NS: manualConsoleNs,
    IMAGE_NAME: `kubevirt-plugin-${instanceKey}`,
    BUILD_DIR: `${workspace}/plugin-src`,
  };

  const outputFile = execSync('mktemp', { encoding: 'utf8' }).trim();

  try {
    execSync(`bash ci-scripts/manual-console/images/setup-plugin-image.sh | tee "${outputFile}"`, {
      stdio: 'inherit',
      env,
      cwd: workspace,
    });

    const content = readFileSync(outputFile, 'utf8');
    const match = content.match(/^IMAGE_REF=(.+)$/m);
    if (!match?.[1]) {
      console.error('::error::setup-plugin-image.sh did not output IMAGE_REF=');
      process.exit(1);
    }

    appendFileSync(process.env.GITHUB_OUTPUT!, `image=${match[1]}\n`);
  } finally {
    try {
      unlinkSync(outputFile);
    } catch {
      /* best effort */
    }
  }
};

main();
