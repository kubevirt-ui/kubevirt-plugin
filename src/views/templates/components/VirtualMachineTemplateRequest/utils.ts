import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  V1alpha1VirtualMachineTemplateRequest,
  V1alpha1VirtualMachineTemplateRequestStatusConditions,
} from '@kubevirt-ui-ext/kubevirt-api/virt-template';
import { VirtualMachineTemplateRequestModel } from '@kubevirt-utils/models';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';

import { VMTemplateRequestConditionType, VMTemplateRequestStatus } from './constants';

const getCondition = (
  vmtr: V1alpha1VirtualMachineTemplateRequest,
  type: VMTemplateRequestConditionType,
): undefined | V1alpha1VirtualMachineTemplateRequestStatusConditions =>
  vmtr?.status?.conditions?.find((c) => c.type === type);

export const getVMTemplateRequestStatus = (
  vmtr: V1alpha1VirtualMachineTemplateRequest,
): VMTemplateRequestStatus => {
  const readyCondition = getCondition(vmtr, VMTemplateRequestConditionType.Ready);
  const progressingCondition = getCondition(vmtr, VMTemplateRequestConditionType.Progressing);

  if (progressingCondition?.status === 'True' || !readyCondition)
    return VMTemplateRequestStatus.InProgress;

  if (readyCondition.status === 'True') return VMTemplateRequestStatus.Succeeded;

  return VMTemplateRequestStatus.Failed;
};

export const getVMTemplateRequestStatusMessage = (
  vmtr: V1alpha1VirtualMachineTemplateRequest,
): string | undefined => {
  const readyCondition = getCondition(vmtr, VMTemplateRequestConditionType.Ready);
  return readyCondition?.message;
};

export const createVMTemplateRequest = (
  vm: V1VirtualMachine,
  templateName: string,
  templateNamespace: string,
): Promise<V1alpha1VirtualMachineTemplateRequest> => {
  const vmTemplateRequest: V1alpha1VirtualMachineTemplateRequest = {
    apiVersion: `${VirtualMachineTemplateRequestModel.apiGroup}/${VirtualMachineTemplateRequestModel.apiVersion}`,
    kind: VirtualMachineTemplateRequestModel.kind,
    metadata: {
      name: templateName,
      namespace: templateNamespace,
    },
    spec: {
      templateName,
      virtualMachineRef: {
        name: getName(vm),
        namespace: getNamespace(vm),
      },
    },
  };

  return kubevirtK8sCreate({
    cluster: getCluster(vm),
    data: vmTemplateRequest,
    model: VirtualMachineTemplateRequestModel,
  });
};
