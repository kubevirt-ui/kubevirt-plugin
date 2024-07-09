import produce from 'immer';
import { create } from 'zustand';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getInstanceTypeFromVolume } from '@kubevirt-utils/components/AddBootableVolumeModal/utils/utils';
import { VolumeSnapshotKind } from '@kubevirt-utils/components/SelectSnapshot/types';
import { DEFAULT_PREFERENCE_LABEL } from '@kubevirt-utils/resources/bootableresources/constants';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { getLabel } from '@kubevirt-utils/resources/shared';
import { generatePrettyName } from '@kubevirt-utils/utils/utils';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

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
      volumeSnapshotSource: VolumeSnapshotKind,
    ) =>
      set(
        produce<InstanceTypeVMStore>(({ instanceTypeVMState }) => {
          instanceTypeVMState.selectedBootableVolume = selectedVolume;
          instanceTypeVMState.pvcSource = pvcSource;
          instanceTypeVMState.volumeSnapshotSource = volumeSnapshotSource;
          instanceTypeVMState.selectedInstanceType = {
            name: getInstanceTypeFromVolume(selectedVolume),
            namespace: null,
          };

          const osName = getLabel(selectedVolume, DEFAULT_PREFERENCE_LABEL)?.replaceAll('.', '-');
          instanceTypeVMState.vmName = generatePrettyName(osName);
        }),
      ),
    resetInstanceTypeVMState: () => set(instanceTypeVMStoreInitialState),
    setCustomDiskSize: (diskSize: null | string) =>
      set(
        produce<InstanceTypeVMStore>(({ instanceTypeVMState }) => {
          instanceTypeVMState.customDiskSize = diskSize;
        }),
      ),
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
    setStartVM: (checked) => {
      set({ startVM: checked });
    },
    setVM: async (vm) => {
      await k8sCreate<V1VirtualMachine>({
        data: vm,
        model: VirtualMachineModel,
        queryParams: {
          dryRun: 'All',
          fieldManager: 'kubectl-create',
        },
      });
      set({ vm });
    },
    setVMNamespaceTarget: (sshSecretName, targetNamespace) => {
      get().setIsChangingNamespace();
      get().applySSHFromSettings(sshSecretName, targetNamespace);
    },
    setVolumeListNamespace: (namespace) => {
      set({ volumeListNamespace: namespace });
    },
  };
});
