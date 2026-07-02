import { useMemo } from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAnnotation } from '@kubevirt-utils/resources/shared';
import { ANNOTATIONS, OS_NAME_LABELS } from '@kubevirt-utils/resources/template';
import { matchOSName } from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { vmiStatuses } from '@kubevirt-utils/resources/vmi';

const getOSName = (obj: V1VirtualMachineInstance): string | undefined =>
  matchOSName(getAnnotation(obj, ANNOTATIONS.os));

enum VMIFilterID {
  OS = 'vmi-os',
  STATUS = 'vmi-status',
}

const useVMIListFilters = (): KubevirtFilter<V1VirtualMachineInstance>[] => {
  const { t } = useKubevirtTranslation();

  return useMemo(
    () => [
      {
        categoryLabel: t('Status'),
        id: VMIFilterID.STATUS,
        match: (obj, selected) => selected.includes(obj?.status?.phase),
        options: Object.keys(vmiStatuses).map((status) => ({
          label: status,
          value: status,
        })),
      },
      {
        categoryLabel: t('OS'),
        id: VMIFilterID.OS,
        match: (obj, selected) => selected.includes(getOSName(obj)),
        options: Object.values(OS_NAME_LABELS).map((osName) => ({
          label: osName,
          value: osName,
        })),
      },
    ],
    [t],
  );
};

export default useVMIListFilters;
