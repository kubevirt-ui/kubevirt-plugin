import produce from 'immer';

import { VirtualMachineCloneModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { VirtualMachineSnapshotModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  V1beta1VirtualMachineClone,
  V1beta1VirtualMachineSnapshot,
  V1VirtualMachine,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  buildRunStrategyPatches,
  getStartingRunStrategy,
} from '@kubevirt-utils/components/RunStrategyModal/utils';
import { getEffectiveRunStrategy } from '@kubevirt-utils/resources/vm/utils/selectors';
import { isVM } from '@kubevirt-utils/utils/typeGuards';
import { getRandomChars, truncateToK8sName } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sCreate, kubevirtK8sGet } from '@multicluster/k8sRequests';

const cloneVMToVM: V1beta1VirtualMachineClone = {
  apiVersion: `${VirtualMachineCloneModel.apiGroup}/${VirtualMachineCloneModel.apiVersion}`,
  kind: VirtualMachineCloneModel.kind,
  metadata: {
    name: 'placeholder',
  },
  spec: {
    source: {
      apiGroup: VirtualMachineModel.apiGroup,
      kind: VirtualMachineModel.kind,
      name: 'placeholder-1',
    },
    target: {
      apiGroup: VirtualMachineModel.apiGroup,
      kind: VirtualMachineModel.kind,
      name: 'placeholder-2',
    },
  },
};

export const cloneVM = (
  source: V1beta1VirtualMachineSnapshot | V1VirtualMachine,
  newVMName: string,
  namespace: string,
  startVM?: boolean,
  volumeNamePolicy?: string,
) => {
  const cloningRequest = produce(cloneVMToVM, (draftCloneData) => {
    draftCloneData.spec.source = {
      apiGroup: isVM(source) ? VirtualMachineModel.apiGroup : VirtualMachineSnapshotModel.apiGroup,
      kind: source.kind,
      name: source.metadata.name,
    };

    draftCloneData.spec.target.name = newVMName;

    draftCloneData.metadata.namespace = namespace;

    draftCloneData.metadata.name = truncateToK8sName(newVMName, `${getRandomChars(6)}-cr`);

    if (volumeNamePolicy) {
      draftCloneData.spec.volumeNamePolicy = volumeNamePolicy;
    }

    if (startVM) {
      const sourceVM = source as V1VirtualMachine;
      const targetRunStrategy = getStartingRunStrategy(getEffectiveRunStrategy(sourceVM));
      const patches = buildRunStrategyPatches(sourceVM, targetRunStrategy);
      draftCloneData.spec.patches = patches.map((p) => JSON.stringify(p));
    }
  });

  return kubevirtK8sCreate<V1beta1VirtualMachineClone>({
    cluster: source?.cluster,
    data: cloningRequest,
    model: VirtualMachineCloneModel,
  });
};

export const vmExists = (vmName: string, vmNamespace: string, cluster?: string) =>
  kubevirtK8sGet<V1VirtualMachine>({
    cluster,
    model: VirtualMachineModel,
    name: vmName,
    ns: vmNamespace,
  }).catch((error) => {
    if (error.code !== 404) {
      throw error;
    }

    return null;
  });
