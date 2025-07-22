import { modelToGroupVersionKind } from '@kubevirt-utils/models';

export const getSelectableOptions = (
  resources: string[],
  groupVersionKind: ReturnType<typeof modelToGroupVersionKind>,
) =>
  resources
    .sort((a, b) => a.localeCompare(b))
    .map((resource) => {
      return {
        children: resource,
        groupVersionKind: groupVersionKind,
        value: resource,
      };
    });
