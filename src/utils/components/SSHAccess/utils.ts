import { ServiceModel } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineInstanceModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineInstanceModel';
import { IoK8sApiCoreV1ServiceSpecTypeEnum } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { k8sCreate, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

import { PORT, SSH_PORT, TEMPLATE_VM_NAME_LABEL } from './constants';

const buildSSHServiceFromVM = (name: string, namespace: string) => ({
  kind: ServiceModel.kind,
  apiVersion: ServiceModel.apiVersion,
  metadata: {
    name: `${name}-ssh-service`,
    namespace: namespace,
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
      [TEMPLATE_VM_NAME_LABEL]: name,
    },
  },
});

export const createSSHService = async (vmi: V1VirtualMachineInstance) => {
  const { namespace, labels } = vmi?.metadata;

  let vmiWithVMLabel = vmi;
  if (!labels[TEMPLATE_VM_NAME_LABEL]) {
    vmiWithVMLabel = await k8sPatch<V1VirtualMachineInstance>({
      model: VirtualMachineInstanceModel,
      resource: vmi,
      data: [
        {
          op: 'add',
          path: `/metadata/labels/${TEMPLATE_VM_NAME_LABEL.replaceAll('/', '~1')}`,
          value: vmi?.metadata?.name,
        },
      ],
    });
  }

  const serviceResource = buildSSHServiceFromVM(
    vmiWithVMLabel?.metadata?.name,
    vmiWithVMLabel?.metadata?.namespace,
  );

  await k8sCreate({
    model: ServiceModel,
    data: serviceResource,
    ns: namespace,
  });
};
