import { ServiceModel } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineInstanceModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineInstanceModel';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { IoK8sApiCoreV1Service } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getRandomChars } from '@kubevirt-utils/utils/utils';
import {
  k8sCreate,
  k8sDelete,
  k8sPatch,
  K8sResourceCommon,
} from '@openshift-console/dynamic-plugin-sdk';

import { buildOwnerReference } from './../../resources/shared';
import { PORT, SERVICE_TYPES, SSH_PORT, VMI_LABEL_AS_SSH_SERVICE_SELECTOR } from './constants';

const buildSSHServiceFromVM = (vm: V1VirtualMachine, type: SERVICE_TYPES, sshLabel: string) => ({
  kind: ServiceModel.kind,
  apiVersion: ServiceModel.apiVersion,
  metadata: {
    name: `${vm?.metadata?.name}-${type.toLowerCase()}-ssh-service`,
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

export const createSSHService = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
  type: SERVICE_TYPES,
): Promise<K8sResourceCommon> => {
  const { namespace, name } = vm?.metadata || {};
  const vmiLabels = vm?.spec?.template?.metadata?.labels;
  const labelSelector =
    vmiLabels[VMI_LABEL_AS_SSH_SERVICE_SELECTOR] || `${name}-${getRandomChars()}`;

  if (!vmiLabels[VMI_LABEL_AS_SSH_SERVICE_SELECTOR]) {
    k8sPatch({
      model: VirtualMachineModel,
      resource: vm,
      data: [
        {
          op: 'add',
          path: `/spec/template/metadata/labels/${VMI_LABEL_AS_SSH_SERVICE_SELECTOR.replaceAll(
            '/',
            '~1',
          )}`,
          value: labelSelector,
        },
      ],
    });

    if (vmi)
      k8sPatch<V1VirtualMachineInstance>({
        model: VirtualMachineInstanceModel,
        resource: vmi,
        data: [
          {
            op: 'add',
            path: `/metadata/labels/${VMI_LABEL_AS_SSH_SERVICE_SELECTOR.replaceAll('/', '~1')}`,
            value: labelSelector,
          },
        ],
      });
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
