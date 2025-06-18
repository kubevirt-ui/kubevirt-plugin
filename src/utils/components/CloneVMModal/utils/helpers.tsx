import produce from 'immer';

import VirtualMachineCloneModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineCloneModel';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import VirtualMachineSnapshotModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineSnapshotModel';
import {
  V1beta1VirtualMachineClone,
  V1beta1VirtualMachineSnapshot,
  V1VirtualMachine,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { RUNSTRATEGY_ALWAYS } from '@kubevirt-utils/constants/constants';
import { MAX_K8S_NAME_LENGTH } from '@kubevirt-utils/utils/constants';
import { isVM } from '@kubevirt-utils/utils/typeGuards';
import { getRandomChars } from '@kubevirt-utils/utils/utils';
import { fleetK8sCreate, fleetK8sGet, fleetK8sPatch } from '@stolostron/multicluster-sdk';

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
) => {
  const cloningRequest = produce(cloneVMToVM, (draftCloneData) => {
    draftCloneData.spec.source = {
      apiGroup: isVM(source) ? VirtualMachineModel.apiGroup : VirtualMachineSnapshotModel.apiGroup,
      kind: source.kind,
      name: source.metadata.name,
    };

    draftCloneData.spec.target.name = newVMName;

    draftCloneData.metadata.namespace = namespace;

    draftCloneData.metadata.name = `${newVMName}-${getRandomChars(6)}-cr`.substring(
      0,
      MAX_K8S_NAME_LENGTH,
    );

    if (draftCloneData.metadata.name.endsWith('-')) {
      draftCloneData.metadata.name = draftCloneData.metadata.name.slice(0, -1);
    }
  });

  return fleetK8sCreate<V1beta1VirtualMachineClone>({
    cluster: source?.cluster,
    data: cloningRequest,
    model: VirtualMachineCloneModel,
  });
};

export const runVM = (vmName: string, vmNamespace: string, cluster?: string, useRunning = false) =>
  fleetK8sPatch({
    data: [
      useRunning
        ? {
            op: 'replace',
            path: '/spec/running',
            value: true,
          }
        : {
            op: 'replace',
            path: '/spec/runStrategy',
            value: RUNSTRATEGY_ALWAYS,
          },
    ],
    model: VirtualMachineModel,
    resource: {
      apiVersion: VirtualMachineModel.apiVersion,
      cluster,
      kind: VirtualMachineModel.kind,
      metadata: { name: vmName, namespace: vmNamespace },
    },
  });

export const vmExist = (vmName: string, vmNamespace: string, cluster?: string) =>
  fleetK8sGet<V1VirtualMachine>({
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
