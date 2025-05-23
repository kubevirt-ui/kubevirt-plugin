import { useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getInstanceTypePrefix } from '@kubevirt-utils/resources/bootableresources/helpers';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

export const useInstanceTypesFilter = (vms: V1VirtualMachine[]): RowFilter<V1VirtualMachine> => {
  const noInstanceType = t('No InstanceType');
  const instanceTypes = useMemo(
    () =>
      [
        ...new Set(
          (Array.isArray(vms) ? vms : [])?.map((vm) => {
            const instanceTypeName = getInstanceTypePrefix(vm?.spec?.instancetype?.name);
            return instanceTypeName ?? noInstanceType;
          }),
        ),
      ].map((instanceType) => ({ id: instanceType, title: instanceType })),
    [vms, noInstanceType],
  );

  return {
    filter: (selectedInstanceTypes, obj) => {
      const instanceTypeName = getInstanceTypePrefix(obj?.spec?.instancetype?.name);
      return (
        selectedInstanceTypes.selected?.length === 0 ||
        selectedInstanceTypes.selected?.includes(instanceTypeName || noInstanceType)
      );
    },
    filterGroupName: t('InstanceType'),
    items: instanceTypes,
    reducer: (obj) => {
      const instanceTypeName = getInstanceTypePrefix(obj?.spec?.instancetype?.name);
      return instanceTypeName ?? noInstanceType;
    },
    type: VirtualMachineRowFilterType.InstanceType,
  };
};
