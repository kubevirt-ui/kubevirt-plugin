/**
 * Kubeadmin `oc` cleanup for non-priv Playwright lanes (CNV-98979).
 * Browser session is the test user — cluster/namespace teardown must use kubeadmin.
 */

import { runOcCommand } from '@/utils/cluster-oc';
import { logger } from '@/utils/logger';
import { MINUTE, SECOND } from '@/utils/test-config';

function tryOc(cmd: string, kubeconfig: string, timeoutMs = MINUTE): string | undefined {
  try {
    return runOcCommand(cmd, kubeconfig, timeoutMs);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    // Missing CRD / unknown kind is expected on lean clusters — stay quiet.
    if (
      !/doesn't have a resource type|the server could not find the requested resource|NotFound/i.test(
        msg,
      )
    ) {
      logger.warn(`oc teardown soft-fail: ${cmd} — ${msg}`);
    }
    return undefined;
  }
}

function listNames(jsonpathCmd: string, kubeconfig: string): string[] {
  const out = tryOc(jsonpathCmd, kubeconfig);
  if (!out) return [];
  return out
    .split('\n')
    .map((n) => n.trim())
    .filter(Boolean);
}

export function ocDeletePwMigrationPolicies(kubeconfig: string): void {
  const names = listNames(
    `oc get migrationpolicy -o jsonpath='{range .items[*]}{.metadata.name}{"\\n"}{end}'`,
    kubeconfig,
  ).filter((n) => n.startsWith('pw-') || n.startsWith('test-') || n === 'example');
  for (const name of names) {
    tryOc(`oc delete migrationpolicy ${name} --ignore-not-found --wait=false`, kubeconfig);
  }
}

export function ocDeletePwClusterInstanceTypes(kubeconfig: string): void {
  const names = listNames(
    `oc get virtualmachineclusterinstancetype -o jsonpath='{range .items[*]}{.metadata.name}{"\\n"}{end}'`,
    kubeconfig,
  ).filter(
    (n) =>
      n.startsWith('pw-') ||
      n.startsWith('cluster-instancetype-') ||
      n.startsWith('standard-cluster-it-') ||
      n.startsWith('high-perf-cluster-it-') ||
      n.startsWith('test-cluster-instancetype-'),
  );
  for (const name of names) {
    tryOc(
      `oc delete virtualmachineclusterinstancetype ${name} --ignore-not-found --wait=false`,
      kubeconfig,
    );
  }
}

export function ocRestoreHyperConvergedDefaults(kubeconfig: string): void {
  const ns = 'openshift-cnv';
  const name = 'kubevirt-hyperconverged';
  const raw = tryOc(`oc get hyperconverged ${name} -n ${ns} -o json`, kubeconfig);
  if (!raw) {
    logger.info('HCO not available — skipping restore (oc)');
    return;
  }
  let spec: Record<string, unknown> = {};
  try {
    const parsed = JSON.parse(raw) as { spec?: Record<string, unknown> };
    spec = parsed.spec ?? {};
  } catch {
    return;
  }

  const patchOps: Array<Record<string, unknown>> = [];
  const hostDevices = spec.permittedHostDevices as
    | { passt?: { enabled?: boolean }; scsi?: { enabled?: boolean } }
    | undefined;
  if (hostDevices?.passt?.enabled === true) {
    patchOps.push({
      op: 'replace',
      path: '/spec/permittedHostDevices/passt/enabled',
      value: false,
    });
  }
  if (hostDevices?.scsi?.enabled === true) {
    patchOps.push({
      op: 'replace',
      path: '/spec/permittedHostDevices/scsi/enabled',
      value: false,
    });
  }
  if (spec.ksmConfiguration !== undefined) {
    patchOps.push({ op: 'remove', path: '/spec/ksmConfiguration' });
  }
  if (spec.liveMigrationConfig !== undefined) {
    patchOps.push({ op: 'remove', path: '/spec/liveMigrationConfig' });
  }
  if (spec.higherWorkloadDensity !== undefined) {
    patchOps.push({ op: 'remove', path: '/spec/higherWorkloadDensity' });
  }

  if (patchOps.length === 0) {
    logger.info('No hyperconverged settings to restore (oc)');
    return;
  }
  const patch = JSON.stringify(patchOps).replace(/'/g, "'\\''");
  tryOc(`oc patch hyperconverged ${name} -n ${ns} --type json -p '${patch}'`, kubeconfig);
  logger.success('✓ Restored hyperconverged settings via kubeadmin oc');
}

export function ocRestoreKubevirtUiFeaturesDefaults(kubeconfig: string): void {
  tryOc(
    `oc patch configmap kubevirt-ui-features -n openshift-cnv --type merge -p '{"data":{"hideYamlTab":"false","disabledGuestSystemLogsAccess":"false","hideCredentialsNonPrivileged":"false","confirmVMActions":"false"}}'`,
    kubeconfig,
  );
}

export function ocDeletePwVmsInNamespace(namespace: string, kubeconfig: string): void {
  const names = listNames(
    `oc get vm -n ${namespace} -o jsonpath='{range .items[*]}{.metadata.name}{"\\n"}{end}'`,
    kubeconfig,
  ).filter((n) => n.startsWith('pw-'));
  for (const name of names) {
    tryOc(
      `oc delete vm ${name} -n ${namespace} --ignore-not-found --wait=false`,
      kubeconfig,
      2 * MINUTE,
    );
  }
}

export function ocDeletePwDataVolumesInNamespace(namespace: string, kubeconfig: string): void {
  const names = listNames(
    `oc get datavolume -n ${namespace} -o jsonpath='{range .items[*]}{.metadata.name}{"\\n"}{end}'`,
    kubeconfig,
  ).filter((n) => n.startsWith('pw-'));
  for (const name of names) {
    tryOc(
      `oc delete datavolume ${name} -n ${namespace} --ignore-not-found --wait=false`,
      kubeconfig,
      2 * MINUTE,
    );
  }
}

export function ocRemoveVmDeleteProtection(namespace: string, kubeconfig: string): void {
  const names = listNames(
    `oc get vm -n ${namespace} -o jsonpath='{range .items[*]}{.metadata.name}{"\\n"}{end}'`,
    kubeconfig,
  );
  for (const name of names) {
    tryOc(
      `oc label vm ${name} -n ${namespace} kubevirt.io/vm-delete-protection- kubevirt.io/delete-protection- --overwrite`,
      kubeconfig,
      30 * SECOND,
    );
  }
}

/** Bulk-delete common test kinds in the shared test namespace (keep the namespace). */
export function ocCleanupTestNamespaceResources(namespace: string, kubeconfig: string): void {
  if (!namespace) return;
  const kinds = [
    'virtualmachine',
    'virtualmachineinstance',
    'datavolume',
    'persistentvolumeclaim',
    'pod',
    'secret',
    'configmap',
    // Fully-qualified name — short "networkattachmentdefinition" is not registered on all clusters.
    'network-attachment-definitions.k8s.cni.cncf.io',
    'virtualmachinesnapshot',
    'virtualmachinerestore',
  ];
  for (const kind of kinds) {
    tryOc(
      `oc delete ${kind} -n ${namespace} -l app.kubernetes.io/managed-by=playwright-test --ignore-not-found --wait=false`,
      kubeconfig,
      2 * MINUTE,
    );
    // Also delete pw-* named resources without the label.
    const names = listNames(
      `oc get ${kind} -n ${namespace} -o jsonpath='{range .items[*]}{.metadata.name}{"\\n"}{end}'`,
      kubeconfig,
    ).filter((n) => n.startsWith('pw-'));
    for (const name of names) {
      tryOc(
        `oc delete ${kind} ${name} -n ${namespace} --ignore-not-found --wait=false`,
        kubeconfig,
        2 * MINUTE,
      );
    }
  }
}

/** Delete ephemeral pw-* namespaces except the persistent shared test namespace. */
export function ocDeletePwNamespacesExcept(keepNamespace: string, kubeconfig: string): void {
  const names = listNames(
    `oc get ns -o jsonpath='{range .items[*]}{.metadata.name}{"\\n"}{end}'`,
    kubeconfig,
  ).filter((n) => n.startsWith('pw-') && n !== keepNamespace);
  if (names.length === 0) {
    logger.info('No test namespaces to clean up (oc)');
    return;
  }
  logger.info(`Cleaning up ${names.length} test namespace(s) via kubeadmin oc...`);
  for (const name of names) {
    tryOc(`oc delete project ${name} --ignore-not-found --wait=false`, kubeconfig, 2 * MINUTE);
    logger.info(`✓ Deleted test namespace: ${name}`);
  }
  logger.success('Completed test namespace cleanup (oc)');
}
