import {
  patchConsoleUserSettings,
  patchKubevirtUserSettingsHideWelcomeForUser,
  pinKubeconfigToProcess,
} from '@/utils/cluster-oc';
import { ensureConsoleGuidedTourCompletedViaOc } from '@/utils/console-guided-tour';
import { EnvVariables } from '@/utils/env-variables';
import { listNonPrivTestUsers } from '@/utils/nonpriv-user-setup';
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
  // `console.guidedTour` for kubeadmin, the configured test user and every HTPasswd
  // `test-users` account (including ones created in this run, before their first login).
  ensureConsoleGuidedTourCompletedViaOc(kubeconfigPath, [
    EnvVariables.username,
    options.userSettingsKey,
    ...listNonPrivTestUsers(kubeconfigPath),
  ]);
}
