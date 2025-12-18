import produce from 'immer';

import { ServiceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { VirtualMachineInstanceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { IoK8sApiCoreV1Service } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getCloudInitCredentials } from '@kubevirt-utils/resources/vmi';
import { ensurePath, getRandomChars, isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sCreate, kubevirtK8sDelete, kubevirtK8sUpdate } from '@multicluster/k8sRequests';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { buildOwnerReference, getName, getNamespace } from './../../resources/shared';
import { PORT, SERVICE_TYPES, SSH_PORT, VM_LABEL_AS_SSH_SERVICE_SELECTOR } from './constants';

const buildSSHServiceFromVM = (vm: V1VirtualMachine, type: SERVICE_TYPES) => ({
  apiVersion: ServiceModel.apiVersion,
  kind: ServiceModel.kind,
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
    selector: {
      [VM_LABEL_AS_SSH_SERVICE_SELECTOR]: vm?.metadata?.name,
    },
    type,
  },
});

export const deleteSSHService = (sshService: IoK8sApiCoreV1Service) =>
  kubevirtK8sDelete<IoK8sApiCoreV1Service>({
    model: ServiceModel,
    name: sshService?.metadata?.name,
    ns: sshService?.metadata?.namespace,
    resource: sshService,
  });

export const addSSHSelectorLabelToVM = async (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
  labelValue,
) => {
  const vmWithLabel = produce(vm, (draftVM) => {
    ensurePath(draftVM, 'spec.template.metadata.labels');

    draftVM.spec.template.metadata.labels[VM_LABEL_AS_SSH_SERVICE_SELECTOR] = labelValue;
  });

  if (vmi) {
    const vmiWithLabel = produce(vmi, (draftVMI) => {
      ensurePath(draftVMI, 'metadata.labels');

      draftVMI.metadata.labels[VM_LABEL_AS_SSH_SERVICE_SELECTOR] = labelValue;
    });

    await kubevirtK8sUpdate<V1VirtualMachineInstance>({
      cluster: getCluster(vmi),
      data: vmiWithLabel,
      model: VirtualMachineInstanceModel,
      name: vmiWithLabel?.metadata?.name,
      ns: vmiWithLabel?.metadata?.namespace,
    });
  }

  return kubevirtK8sUpdate<V1VirtualMachine>({
    cluster: getCluster(vm),
    data: vmWithLabel,
    model: VirtualMachineModel,
    name: vmWithLabel?.metadata?.name,
    ns: vmWithLabel?.metadata?.namespace,
  });
};

export const createSSHService = async (
  vm: V1VirtualMachine,
  type: SERVICE_TYPES,
): Promise<K8sResourceCommon> => {
  const serviceResource = buildSSHServiceFromVM(vm, type);

  return kubevirtK8sCreate({
    cluster: getCluster(vm),
    data: serviceResource,
    model: ServiceModel,
    ns: getNamespace(vm),
  });
};

export const getConsoleVirtctlCommand = (vm: V1VirtualMachine, identityFlag?: string) => {
  const [vmName, vmNamespace, userName] = [
    getName(vm),
    getNamespace(vm),
    getCloudInitCredentials(vm)?.users?.[0]?.name,
  ];

  return `virtctl -n ${vmNamespace} ssh ${userName}@vm/${vmName} ${
    !isEmpty(identityFlag) ? identityFlag : '--identity-file=<path_to_sshkey>'
  }`;
};
