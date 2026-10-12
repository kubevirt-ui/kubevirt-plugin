/**
 * Download and install openshift-install, oc, kubectl, and ccoctl
 * from the OpenShift mirror for IPI clusters.
 * Replaces: inline bash in ibmc-cluster-setup.yml
 *
 * Required env: OC_VERSION_INPUT
 * Output: ocp_channel, ocp_version
 */

import { execSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';

import { requireEnv } from '../kube-client';

const main = async (): Promise<void> => {
  const versionInput = requireEnv('OC_VERSION_INPUT');
  const ocpBase = versionInput.split('_')[0];

  const { mirror, ocpChannel } = /^\d+\.\d+\.\d+$/.test(ocpBase)
    ? ((): { mirror: string; ocpChannel: string } => {
        console.log(`Using pinned OCP version: ${ocpBase}`);
        return {
          mirror: `https://mirror.openshift.com/pub/openshift-v4/x86_64/clients/ocp/${ocpBase}`,
          ocpChannel: '',
        };
      })()
    : ((): { mirror: string; ocpChannel: string } => {
        const channel = `stable-${ocpBase}`;
        console.log(`Resolving ${channel} to latest patch version...`);
        return {
          mirror: `https://mirror.openshift.com/pub/openshift-v4/x86_64/clients/ocp/${channel}`,
          ocpChannel: channel,
        };
      })();

  console.log('Downloading openshift-install...');
  execSync(
    `curl -sL "${mirror}/openshift-install-linux.tar.gz" | tar -xz -C /usr/local/bin openshift-install`,
    {
      stdio: 'inherit',
    },
  );
  execSync('openshift-install version', { stdio: 'inherit' });

  console.log('Downloading oc + kubectl...');
  execSync(
    `curl -sL "${mirror}/openshift-client-linux.tar.gz" | tar -xz -C /usr/local/bin oc kubectl`,
    {
      stdio: 'inherit',
    },
  );
  execSync('oc version --client', { stdio: 'inherit' });

  console.log('Downloading ccoctl...');
  try {
    execSync(`curl -sL "${mirror}/ccoctl-linux.tar.gz" | tar -xz -C /usr/local/bin ccoctl`, {
      stdio: 'inherit',
    });
  } catch {
    console.log('ccoctl not available for this version');
  }

  const versionLine = execSync('openshift-install version', { encoding: 'utf8' }).split('\n')[0];
  const resolvedVersion = versionLine.split(/\s+/)[1] ?? ocpBase;

  const outputFile = process.env.GITHUB_OUTPUT;
  if (outputFile) {
    appendFileSync(outputFile, `ocp_channel=${ocpChannel}\nocp_version=${resolvedVersion}\n`);
  }
};

void main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
