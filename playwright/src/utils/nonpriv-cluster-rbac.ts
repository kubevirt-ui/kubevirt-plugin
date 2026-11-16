/**
 * Kubeadmin oc grants for non-priv Playwright lanes (CNV-98979 + grant-kubevirt-access).
 * Console session as `test` cannot create RoleBindings — these must run before UI login.
 */

import * as fs from 'fs';

import { ensureConsoleCliDownloadReaderRbac } from '@/utils/console-cli-download-rbac';
import { resolveKubeconfig, runOcCommand } from '@/utils/cluster-oc';
import { EnvVariables } from '@/utils/env-variables';
import { ensureKubevirtUiFeaturesReaderRbac } from '@/utils/kubevirt-ui-features';
import { ensureKubevirtUserSettingsReaderRbac } from '@/utils/kubevirt-user-settings';
import { logger } from '@/utils/logger';
import { MINUTE } from '@/utils/test-config';

function tryOc(cmd: string, kubeconfig: string): void {
  try {
    runOcCommand(cmd, kubeconfig, MINUTE);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    // Already bound / already exists is fine.
    if (!/already|exists|Conflict|409/i.test(msg)) {
      logger.warn(`oc grant soft-fail: ${cmd} — ${msg}`);
    }
  }
}

/**
 * Cluster + openshift-cnv read access so non-priv can use catalog, templates, CDI, HCO flags.
 * Namespace admin for the shared test project is handled separately in setup.
 */
export async function grantNonPrivClusterRbac(options: {
  kubeconfigPath: string;
  cnvNamespace: string;
  testNamespace: string;
  username?: string;
}): Promise<void> {
  const kubeconfig = options.kubeconfigPath;
  const username = options.username ?? EnvVariables.testUsername;
  const { cnvNamespace, testNamespace } = options;

  await ensureKubevirtUiFeaturesReaderRbac({
    cnvNamespace,
    kubeconfigPath: kubeconfig,
  });
  await ensureKubevirtUserSettingsReaderRbac({
    cnvNamespace,
    kubeconfigPath: kubeconfig,
  });
  await ensureConsoleCliDownloadReaderRbac({ kubeconfigPath: kubeconfig });

  // Cluster read — templates catalog, instance types, migration policy list, CDI DataSources.
  tryOc(`oc adm policy add-cluster-role-to-user view ${username}`, kubeconfig);
  tryOc(`oc adm policy add-cluster-role-to-user kubevirt.io:view ${username}`, kubeconfig);
  tryOc(`oc adm policy add-cluster-role-to-user cdi.kubevirt.io:view ${username}`, kubeconfig);
  tryOc(
    `oc adm policy add-cluster-role-to-user instancetype.kubevirt.io:view ${username}`,
    kubeconfig,
  );

  // openshift-cnv view (HCO / KubeVirt CR for feature gates in UI).
  tryOc(`oc adm policy add-role-to-user view ${username} -n ${cnvNamespace}`, kubeconfig);

  // Shared test namespace: admin + kubevirt edit (admin usually implies edit).
  tryOc(`oc adm policy add-role-to-user admin ${username} -n ${testNamespace}`, kubeconfig);
  tryOc(
    `oc adm policy add-role-to-user kubevirt.io:edit ${username} -n ${testNamespace}`,
    kubeconfig,
  );
  ensureDiskUploaderNamespaceRbac(testNamespace, kubeconfig);

  logger.success(
    `✓ Non-priv cluster RBAC granted for "${username}" (view + CDI/KubeVirt/IT + ${cnvNamespace}/${testNamespace})`,
  );
}

/**
 * Pre-create kubevirt-disk-uploader SA/Role/RoleBinding in a namespace.
 * Upload-to-registry UI creates these in-cluster; parallel create can fail for non-priv
 * with "rolebindings ... kubevirt-disk-uploader not found". Mirror product constants.
 */
export function ensureDiskUploaderNamespaceRbac(namespace: string, kubeconfigPath?: string): void {
  const kube = kubeconfigPath ?? resolveKubeconfigOptional();
  if (!kube) {
    return;
  }

  tryOc(`oc create sa kubevirt-disk-uploader -n ${namespace}`, kube);

  const roleYaml = `
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: kubevirt-disk-uploader
  namespace: ${namespace}
rules:
  - apiGroups: ["export.kubevirt.io"]
    resources: ["virtualmachineexports"]
    verbs: ["get", "create"]
  - apiGroups: [""]
    resources: ["secrets"]
    verbs: ["get", "create"]
  - apiGroups: [""]
    resources: ["pods", "pods/log"]
    verbs: ["get"]
  - apiGroups: [""]
    resources: ["persistentvolumeclaims"]
    verbs: ["get"]
  - apiGroups: ["cdi.kubevirt.io"]
    resources: ["datavolumes"]
    verbs: ["get"]
`.trim();

  const bindingYaml = `
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: kubevirt-disk-uploader
  namespace: ${namespace}
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: kubevirt-disk-uploader
subjects:
  - kind: ServiceAccount
    name: kubevirt-disk-uploader
    namespace: ${namespace}
`.trim();

  applyOcYaml(roleYaml, kube);
  applyOcYaml(bindingYaml, kube);
}

function resolveKubeconfigOptional(): string | undefined {
  try {
    return resolveKubeconfig();
  } catch {
    return undefined;
  }
}

function applyOcYaml(yaml: string, kubeconfig: string): void {
  const tmp = `/tmp/pw-disk-uploader-${Date.now()}-${Math.random().toString(36).slice(2)}.yaml`;
  try {
    fs.writeFileSync(tmp, yaml, 'utf8');
    tryOc(`oc apply -f "${tmp}"`, kubeconfig);
  } finally {
    try {
      fs.unlinkSync(tmp);
    } catch {
      // ignore
    }
  }
}
