/**
 * Download and install openshift-install, oc, kubectl, and ccoctl
 * from the OpenShift mirror for IPI clusters.
 * Replaces: inline bash in ibmc-cluster-setup.yml
 *
 * Required env: OC_VERSION_INPUT
 * Output: ocp_channel, ocp_version
 */

import { appendFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

import { requireEnv } from '../kube-client';

const main = (): void => {
  const versionInput = requireEnv('OC_VERSION_INPUT');
  const ocpBase = versionInput.split('_')[0];

  let mirror: string;
  let ocpChannel = '';

  if (/^\d+\.\d+\.\d+$/.test(ocpBase)) {
    console.log(`Using pinned OCP version: ${ocpBase}`);
    mirror = `https://mirror.openshift.com/pub/openshift-v4/x86_64/clients/ocp/${ocpBase}`;
  } else {
    ocpChannel = `stable-${ocpBase}`;
    console.log(`Resolving ${ocpChannel} to latest patch version...`);
    mirror = `https://mirror.openshift.com/pub/openshift-v4/x86_64/clients/ocp/${ocpChannel}`;
  }

  console.log('Downloading openshift-install...');
  execSync(`curl -sL "${mirror}/openshift-install-linux.tar.gz" | tar -xz -C /usr/local/bin openshift-install`, {
    stdio: 'inherit',
  });
  execSync('openshift-install version', { stdio: 'inherit' });

  console.log('Downloading oc + kubectl...');
  execSync(`curl -sL "${mirror}/openshift-client-linux.tar.gz" | tar -xz -C /usr/local/bin oc kubectl`, {
    stdio: 'inherit',
  });
  execSync('oc version --client', { stdio: 'inherit' });

  console.log('Downloading ccoctl...');
  try {
    execSync(`curl -sL "${mirror}/ccoctl-linux.tar.gz" | tar -xz -C /usr/local/bin ccoctl`, { stdio: 'inherit' });
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

main();
