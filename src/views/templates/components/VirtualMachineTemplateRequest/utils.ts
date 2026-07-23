import {
  type V1alpha1VirtualMachineTemplateRequest,
  type V1alpha1VirtualMachineTemplateRequestStatusConditions,
} from '@kubevirt-ui-ext/kubevirt-api/virt-template';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { VMTemplateRequestConditionType, VMTemplateRequestStatus } from './constants';

const getCondition = (
  vmtr: V1alpha1VirtualMachineTemplateRequest,
  type: VMTemplateRequestConditionType,
): undefined | V1alpha1VirtualMachineTemplateRequestStatusConditions =>
  vmtr?.status?.conditions?.find((condition) => condition.type === type);

export const getVMTemplateRequestStatus = (
  vmtr: V1alpha1VirtualMachineTemplateRequest,
): VMTemplateRequestStatus => {
  if (isEmpty(vmtr?.status)) return VMTemplateRequestStatus.Succeeded;

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
