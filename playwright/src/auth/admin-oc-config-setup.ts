import {
  patchConsoleUserSettings,
  patchKubevirtUserSettingsHideWelcomeForUser,
  pinKubeconfigToProcess,
} from '@/utils/cluster-oc';
import {
  enableDeclarativeHotplugVolumesOnCluster,
  enableDeployPasstNetworkBindingOnCluster,
  enableNativeVmTemplatesPreviewOnCluster,
} from '@/utils/kubevirt-hyperconverged-setup';
import {
  enableInstanceTypesDeveloperPreviewOnCluster,
  enableTreeViewFoldersOnCluster,
} from '@/utils/kubevirt-ui-features';

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
  await enableTreeViewFoldersOnCluster({ cnvNamespace: options.cnvNamespace });
  await enableDeployPasstNetworkBindingOnCluster({
    cnvNamespace: options.cnvNamespace,
    kubeconfigPath,
  });
  await enableDeclarativeHotplugVolumesOnCluster({
    cnvNamespace: options.cnvNamespace,
    kubeconfigPath,
  });
  await enableNativeVmTemplatesPreviewOnCluster({
    cnvNamespace: options.cnvNamespace,
    kubeconfigPath,
  });
  patchConsoleUserSettings(kubeconfigPath, options.userSettingsKey);
  patchKubevirtUserSettingsHideWelcomeForUser(
    kubeconfigPath,
    options.userSettingsKey,
    options.cnvNamespace,
  );
}
