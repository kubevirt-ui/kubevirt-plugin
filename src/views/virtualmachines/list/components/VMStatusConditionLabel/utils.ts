import { type V1VirtualMachineCondition } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';

export const formatConditionLabel = (condition: V1VirtualMachineCondition): string => {
  if (!condition?.type || !condition?.status) {
    return '';
  }

  return `${condition.type}=${condition.status}`;
};

export const getConditionsDisplayValue = (
  conditions: undefined | V1VirtualMachineCondition[],
): string => {
  const labels = (conditions ?? []).map(formatConditionLabel).filter((label) => !isEmpty(label));

  return isEmpty(labels) ? NO_DATA_DASH : labels.join(', ');
};
