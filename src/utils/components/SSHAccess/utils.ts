import { ServiceModel } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineInstanceModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineInstanceModel';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { IoK8sApiCoreV1ServiceSpecTypeEnum } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getRandomChars } from '@kubevirt-utils/utils/utils';
import { k8sCreate, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

import { buildOwnerReference } from './../../resources/shared';
import { PORT, SSH_PORT, VMI_LABEL_AS_SSH_SERVICE_SELECTOR } from './constants';

const buildSSHServiceFromVM = (vm: V1VirtualMachine, sshLabel: string) => ({
  kind: ServiceModel.kind,
  apiVersion: ServiceModel.apiVersion,
  metadata: {
    name: `${vm?.metadata?.name}-ssh-service`,
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
    type: IoK8sApiCoreV1ServiceSpecTypeEnum.NodePort,
    selector: {
      [VMI_LABEL_AS_SSH_SERVICE_SELECTOR]: sshLabel,
    },
  },
});

export const createSSHService = async (vm: V1VirtualMachine, vmi: V1VirtualMachineInstance) => {
  const { namespace, name } = vm?.metadata || {};
  const vmiLabels = vm?.spec?.template?.metadata?.labels;
  const labelSelector =
    vmiLabels[VMI_LABEL_AS_SSH_SERVICE_SELECTOR] || `${name}-${getRandomChars()}`;

  if (!vmiLabels[VMI_LABEL_AS_SSH_SERVICE_SELECTOR]) {
    await k8sPatch({
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
      await k8sPatch<V1VirtualMachineInstance>({
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

  const serviceResource = buildSSHServiceFromVM(vm, labelSelector);

  await k8sCreate({
    model: ServiceModel,
    data: serviceResource,
    ns: namespace,
  });
};
