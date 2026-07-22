/**
 * Install ARC runner scale set: namespace, Helm release, SCC bind, CI RBAC.
 * Replaces: ci-scripts/hot-cluster/arc/install-runner-scale-set.sh
 *
 * Helm calls stay as subprocess (no Node.js Helm SDK exists).
 */

import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { KubeClient, requireEnv } from '../kube-client';

const main = async (): Promise<void> => {
  const configUrl = requireEnv('ARC_CONFIG_URL');
  const controllerNs = process.env.ARC_CONTROLLER_NS ?? 'arc-systems';
  const installName = process.env.ARC_CONTROLLER_INSTALL_NAME ?? 'arc';
  const runnersNs = process.env.ARC_RUNNERS_NS ?? 'arc-runners';
  const helmRepo = 'oci://ghcr.io/actions/actions-runner-controller-charts';
  const arcVersion = process.env.ARC_VERSION ?? '0.14.0';
  const scaleSetName = process.env.RUNNER_SCALE_SET_NAME ?? 'kubevirt-plugin-ci';
  const minRunners = process.env.MIN_RUNNERS ?? '0';
  const maxRunners = process.env.MAX_RUNNERS ?? '2';
  const controllerSaName = `${installName}-gha-rs-controller`;
  const arcDir = resolve(__dirname, '../../../../arc');
  const runnerPodValues = resolve(arcDir, 'arc-runner-scale-set.pod.yaml');

  console.log('=== ARC runner scale set installation (OpenShift) ===');
  console.log(`  ARC_CONFIG_URL:              ${configUrl}`);
  console.log(`  RUNNER_SCALE_SET_NAME:       ${scaleSetName}`);
  console.log(`  MIN_RUNNERS / MAX_RUNNERS:   ${minRunners} / ${maxRunners}`);

  const client = KubeClient.fromKubeconfig();

  // Create namespace
  console.log(`Creating namespace ${runnersNs}...`);
  try {
    await client.coreV1.createNamespace({ body: { metadata: { name: runnersNs } } });
  } catch (err) {
    if ((err as { statusCode?: number }).statusCode !== 409) throw err;
  }

  // Build auth args
  const authArgs: string[] = [];
  if (process.env.ARC_APP_ID && process.env.ARC_APP_INSTALL_ID && process.env.ARC_APP_PRIVATE_KEY) {
    authArgs.push(
      '--set',
      `githubConfigSecret.github_app_id=${process.env.ARC_APP_ID}`,
      '--set',
      `githubConfigSecret.github_app_installation_id=${process.env.ARC_APP_INSTALL_ID}`,
      '--set-file',
      `githubConfigSecret.github_app_private_key=${process.env.ARC_APP_PRIVATE_KEY}`,
    );
  } else if (process.env.ARC_PAT) {
    authArgs.push('--set', `githubConfigSecret.github_token=${process.env.ARC_PAT}`);
  } else {
    console.error('ERROR: Set ARC_APP_ID+ARC_APP_INSTALL_ID+ARC_APP_PRIVATE_KEY or ARC_PAT');
    process.exit(1);
  }

  // Helm install
  const helmArgs = [
    'helm',
    'upgrade',
    scaleSetName,
    `${helmRepo}/gha-runner-scale-set`,
    '--install',
    '--namespace',
    runnersNs,
    '--set',
    `githubConfigUrl=${configUrl}`,
    '--set',
    `minRunners=${minRunners}`,
    '--set',
    `maxRunners=${maxRunners}`,
    '--set',
    `controllerServiceAccount.name=${controllerSaName}`,
    '--set',
    `controllerServiceAccount.namespace=${controllerNs}`,
    ...authArgs,
    '--values',
    runnerPodValues,
    '--wait',
    '--timeout',
    '5m',
  ];
  if (process.env.ARC_RUNNER_IMAGE) {
    helmArgs.push(
      '--set-string',
      `template.spec.containers[0].image=${process.env.ARC_RUNNER_IMAGE}`,
    );
  }
  if (arcVersion && arcVersion !== 'latest') {
    helmArgs.push('--version', arcVersion);
  }

  console.log(`Installing runner scale set '${scaleSetName}'...`);
  execSync(helmArgs.join(' '), { stdio: 'inherit' });

  // SCC binding
  const runnerSa = `${scaleSetName}-gha-rs-no-permission`;
  console.log(`Binding SCC github-arc to runner ServiceAccount ${runnerSa}...`);
  execSync(
    `oc policy add-role-to-user system:openshift:scc:github-arc -z "${runnerSa}" -n "${runnersNs}"`,
    { stdio: 'inherit' },
  );

  // CI RBAC
  if (process.env.SKIP_ARC_RUNNER_RBAC !== '1') {
    const rbacManifest = resolve(arcDir, 'arc-runner-rbac.yaml');
    console.log(`Applying runner CI RBAC...`);
    let rbacYaml = readFileSync(rbacManifest, 'utf8');
    rbacYaml = rbacYaml
      .replace(/name: kubevirt-plugin-ci-gha-rs-no-permission$/, `name: ${runnerSa}`)
      .replace(/namespace: arc-runners$/, `namespace: ${runnersNs}`);
    execSync(`echo '${rbacYaml}' | oc apply -f -`, { stdio: 'inherit' });
  }

  console.log('\n=== Runner scale set installation complete ===');
  console.log(`  runs-on: ${scaleSetName}`);
};

main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
