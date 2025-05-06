import { useCallback } from 'react';

import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAnnotation } from '@kubevirt-utils/resources/shared';
import { ANNOTATIONS, OS_NAME_LABELS } from '@kubevirt-utils/resources/template';
import {
  getOperatingSystem,
  getOperatingSystemName,
} from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

export const useOSFilter = (): RowFilter => {
  const getOSName = useCallback((obj) => {
    const osAnnotation = getAnnotation(obj?.spec?.template, ANNOTATIONS.os);
    const osLabel = getOperatingSystemName(obj) || getOperatingSystem(obj);
    const osName = Object.values(OS_NAME_LABELS).find(
      (osKey) =>
        osAnnotation?.toLowerCase()?.startsWith(osKey?.toLowerCase()) ||
        osLabel?.toLowerCase()?.startsWith(osKey?.toLowerCase()),
    );
    return osName;
  }, []);

  return {
    filter: (selectedOS, obj) => {
      return selectedOS.selected?.length === 0 || selectedOS.selected?.includes(getOSName(obj));
    },
    filterGroupName: t('Operating system'),
    items: Object.values(OS_NAME_LABELS).map((osName) => ({
      id: osName,
      title: osName,
    })),
    reducer: getOSName,
    type: VirtualMachineRowFilterType.OS,
  };
};
