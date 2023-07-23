import { useEffect } from 'react';
import { getOSImagesNS } from 'src/views/clusteroverview/OverviewTab/inventory-card/utils/utils';

import { SecretModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { isEqualObject } from '@kubevirt-utils/components/NodeSelectorModal/utils/helpers';
import { initialSSHCredentials } from '@kubevirt-utils/components/SSHSecretSection/utils/constants';
import { SecretSelectionOption } from '@kubevirt-utils/components/SSHSecretSection/utils/types';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import useBootableVolumes from '@kubevirt-utils/resources/bootableresources/hooks/useBootableVolumes';
import { decodeSecret } from '@kubevirt-utils/resources/secret/utils';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { k8sGet } from '@openshift-console/dynamic-plugin-sdk';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk-internal';

import useInstanceTypesAndPreferences from './hooks/useInstanceTypesAndPreferences';
import { useInstanceTypeVMInitialStore } from './hooks/useInstanceTypeVMInitialStore';
import { instanceTypeActionType } from './utils/types';

export const useInstanceTypeVMStore = () => {
  const store = useInstanceTypeVMInitialStore();

  const bootableVolumesData = useBootableVolumes(getOSImagesNS());
  const instanceTypesAndPreferencesData = useInstanceTypesAndPreferences();
  const [activeNamespace] = useActiveNamespace();
  const [authorizedSSHKeys, , loaded] = useKubevirtUserSettings('ssh');

  useEffect(() => {
    if (!isEqualObject(store.bootableVolumesData, bootableVolumesData)) {
      store.setBootableVolumesData(bootableVolumesData);
    }
  }, [bootableVolumesData, store]);

  useEffect(() => {
    if (!isEqualObject(store.instanceTypesAndPreferencesData, instanceTypesAndPreferencesData)) {
      store.setInstanceTypesAndPreferencesData(instanceTypesAndPreferencesData);
    }
  }, [instanceTypesAndPreferencesData, store]);

  useEffect(() => {
    if (!isEqualObject(store.activeNamespace, activeNamespace)) {
      store.setActiveNamespace(activeNamespace);
      store.setVMNamespaceTarget(
        activeNamespace === ALL_NAMESPACES_SESSION_KEY ? DEFAULT_NAMESPACE : activeNamespace,
      );
      store.setInstanceTypeVMState({
        payload: initialSSHCredentials,
        type: instanceTypeActionType.setSSHCredentials,
      });
    }
  }, [activeNamespace, bootableVolumesData, store]);

  useEffect(() => {
    if (
      loaded &&
      !store.instanceTypeVMState.sshSecretCredentials.appliedDefaultKey &&
      !isEmpty(authorizedSSHKeys?.[store.vmNamespaceTarget])
    ) {
      k8sGet<IoK8sApiCoreV1Secret>({
        model: SecretModel,
        name: authorizedSSHKeys?.[store.vmNamespaceTarget],
        ns: store.vmNamespaceTarget,
      }).then((secret) => {
        store.setInstanceTypeVMState({
          payload: {
            appliedDefaultKey: true,
            applyKeyToProject: true,
            secretOption: SecretSelectionOption.useExisting,
            sshPubKey: decodeSecret(secret),
            sshSecretName: authorizedSSHKeys?.[store.vmNamespaceTarget],
          },
          type: instanceTypeActionType.setSSHCredentials,
        });
      });
    }
  }, [store, authorizedSSHKeys, loaded]);

  return store;
};
