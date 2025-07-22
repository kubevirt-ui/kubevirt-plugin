import { modelToGroupVersionKind } from '@kubevirt-utils/models';
import { isEmpty } from '@kubevirt-utils/utils/utils';

export const getSelectableOptions = (
  resources: string[],
  groupVersionKind: ReturnType<typeof modelToGroupVersionKind>,
  enabledOptions?: string[],
) =>
  resources
    .sort((a, b) => a.localeCompare(b))
    .map((resource) => {
      return {
        children: resource,
        groupVersionKind: groupVersionKind,
        isDisabled: !isEmpty(enabledOptions) && !enabledOptions?.includes(resource),
        value: resource,
      };
    });
