import { patchConsoleUserSettings, pinKubeconfigToProcess } from '@/utils/cluster-oc';
import { enableInstanceTypesDeveloperPreviewOnCluster } from '@/utils/kubevirt-ui-features';

/**
 * Non-priv lanes: patch openshift-cnv + `user-settings-<test>` as kubeadmin (`oc`) in CLUSTER setup,
 * before the test-user browser login.
 */
export async function runAdminOcConfigMapSetup(
  kubeconfigPath: string,
  options: { cnvNamespace?: string; userSettingsKey: string },
): Promise<void> {
  pinKubeconfigToProcess(kubeconfigPath);
  await enableInstanceTypesDeveloperPreviewOnCluster({ cnvNamespace: options.cnvNamespace });
  patchConsoleUserSettings(kubeconfigPath, options.userSettingsKey);
}
