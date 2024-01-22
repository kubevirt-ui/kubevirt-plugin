import produce from 'immer';
import { create } from 'zustand';

import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { getInstanceTypeFromVolume } from '@kubevirt-utils/components/AddBootableVolumeModal/utils/utils';
import { DEFAULT_PREFERENCE_LABEL } from '@kubevirt-utils/resources/bootableresources/constants';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { getLabel } from '@kubevirt-utils/resources/shared';
import { generatePrettyName } from '@kubevirt-utils/utils/utils';

import { instanceTypeVMStoreInitialState } from './utils/state';
import { InstanceTypeVMStore } from './utils/types';
import { getSSHCredentials } from './utils/utils';

export const useInstanceTypeVMStore = create<InstanceTypeVMStore>()((set, get) => {
  return {
    ...instanceTypeVMStoreInitialState,
    applySSHFromSettings: async (sshSecretName, targetNamespace) => {
      const sshSecretCredentials = await getSSHCredentials(sshSecretName, targetNamespace);

      set(
        produce<InstanceTypeVMStore>((currentStore) => {
          currentStore.instanceTypeVMState.sshSecretCredentials = sshSecretCredentials;
          currentStore.vmNamespaceTarget = targetNamespace;
          currentStore.isChangingNamespace = false;
        }),
      );
    },
    onSelectCreatedVolume: (
      selectedVolume: BootableVolume,
      pvcSource: IoK8sApiCoreV1PersistentVolumeClaim,
    ) =>
      set(
        produce<InstanceTypeVMStore>(({ instanceTypeVMState }) => {
          instanceTypeVMState.selectedBootableVolume = selectedVolume;
          instanceTypeVMState.pvcSource = pvcSource;
          instanceTypeVMState.selectedInstanceType = {
            name: getInstanceTypeFromVolume(selectedVolume),
            namespace: null,
          };

          const osName = getLabel(selectedVolume, DEFAULT_PREFERENCE_LABEL).replaceAll('.', '-');
          instanceTypeVMState.vmName = generatePrettyName(osName);
        }),
      ),
    resetInstanceTypeVMState: () => set(instanceTypeVMStoreInitialState),
    setInstanceTypeVMState: ({ payload, type }) =>
      set(
        produce<InstanceTypeVMStore>(({ instanceTypeVMState }) => {
          instanceTypeVMState[type] = payload;
        }),
      ),
    setIsChangingNamespace: () => set({ isChangingNamespace: true }),
    setSelectedStorageClass: (storageClass: string) =>
      set(
        produce<InstanceTypeVMStore>(({ instanceTypeVMState }) => {
          instanceTypeVMState.selectedStorageClass = storageClass;
        }),
      ),
    setVMNamespaceTarget: (sshSecretName, targetNamespace) => {
      get().setIsChangingNamespace();
      get().applySSHFromSettings(sshSecretName, targetNamespace);
    },
  };
});
