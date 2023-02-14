import produce from 'immer';

import { ServiceModel } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineInstanceModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineInstanceModel';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { IoK8sApiCoreV1Service } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ensurePath, getRandomChars } from '@kubevirt-utils/utils/utils';
import {
  k8sCreate,
  k8sDelete,
  K8sResourceCommon,
  k8sUpdate,
} from '@openshift-console/dynamic-plugin-sdk';

import { buildOwnerReference } from './../../resources/shared';
import { PORT, SERVICE_TYPES, SSH_PORT, VMI_LABEL_AS_SSH_SERVICE_SELECTOR } from './constants';

const buildSSHServiceFromVM = (vm: V1VirtualMachine, type: SERVICE_TYPES, sshLabel: string) => ({
  kind: ServiceModel.kind,
  apiVersion: ServiceModel.apiVersion,
  metadata: {
    // max name length is 63 characters
    name: `${vm?.metadata?.name}-${type.toLowerCase()}-ssh-service`
      .substring(0, 56)
      .concat(`-${getRandomChars(4)}`),
    namespace: vm?.metadata?.namespace,
    ownerReferences: [buildOwnerReference(vm, { blockOwnerDeletion: false })],
  },
  spec: {
    ports: [
      {
        port: PORT,
        targetPort: SSH_PORT,
      },
    ],
    type,
    selector: {
      [VMI_LABEL_AS_SSH_SERVICE_SELECTOR]: sshLabel,
    },
  },
});

export const deleteSSHService = (sshService: IoK8sApiCoreV1Service) =>
  k8sDelete<IoK8sApiCoreV1Service>({
    model: ServiceModel,
    resource: sshService,
    name: sshService?.metadata?.name,
    ns: sshService?.metadata?.namespace,
  });

export const addSSHSelectorLabelToVM = async (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
  labelValue,
) => {
  const vmWithLabel = produce(vm, (draftVM) => {
    ensurePath(draftVM, 'spec.template.metadata.labels');

    draftVM.spec.template.metadata.labels[VMI_LABEL_AS_SSH_SERVICE_SELECTOR] = labelValue;
  });

  if (vmi) {
    const vmiWithLabel = produce(vmi, (draftVMI) => {
      ensurePath(draftVMI, 'metadata.labels');

      draftVMI.metadata.labels[VMI_LABEL_AS_SSH_SERVICE_SELECTOR] = labelValue;
    });

    await k8sUpdate<V1VirtualMachineInstance>({
      model: VirtualMachineInstanceModel,
      data: vmiWithLabel,
      name: vmiWithLabel?.metadata?.name,
      ns: vmiWithLabel?.metadata?.namespace,
    });
  }

  return k8sUpdate<V1VirtualMachine>({
    model: VirtualMachineModel,
    data: vmWithLabel,
    name: vmWithLabel?.metadata?.name,
    ns: vmWithLabel?.metadata?.namespace,
  });
};

export const createSSHService = async (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
  type: SERVICE_TYPES,
): Promise<K8sResourceCommon> => {
  const { namespace, name } = vm?.metadata || {};
  const vmiLabels = vm?.spec?.template?.metadata?.labels;
  const labelSelector =
    vmiLabels?.[VMI_LABEL_AS_SSH_SERVICE_SELECTOR] || `${name}-${getRandomChars()}`;

  if (!vmiLabels?.[VMI_LABEL_AS_SSH_SERVICE_SELECTOR]) {
    await addSSHSelectorLabelToVM(vm, vmi, labelSelector);
  }

  const serviceResource = buildSSHServiceFromVM(vm, type, labelSelector);

  return k8sCreate({
    model: ServiceModel,
    data: serviceResource,
    ns: namespace,
  });
};

export const getConsoleVirtctlCommand = (vmName: string, vmNamespace?: string) =>
  `virtctl ${vmNamespace ? `-n ${vmNamespace}` : ''} ssh ${vmName}`;
