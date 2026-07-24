import { useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  getTemplateOS,
  isVirtualMachineTemplateRequest,
  OS_NAME_TYPES,
  OS_NAMES,
  type TemplateOrRequest,
} from '@kubevirt-utils/resources/template';
import { getItemNameWithOther, includeFilter } from '@kubevirt-utils/utils/utils';
import { type RowFilter } from '@openshift-console/dynamic-plugin-sdk';

import { TemplateFilterType } from './types';

const getRowOS = (obj: TemplateOrRequest): string => {
  if (isVirtualMachineTemplateRequest(obj)) {
    return OS_NAME_TYPES.other;
  }

  return getTemplateOS(obj);
};

const useOSFilter = (): RowFilter<TemplateOrRequest> => {
  const { t } = useKubevirtTranslation();

  return useMemo(
    () => ({
      filter: (availableOsNames, obj) => includeFilter(availableOsNames, OS_NAMES, getRowOS(obj)),
      filterGroupName: t('Operating system'),
      items: OS_NAMES,
      reducer: (obj) => getItemNameWithOther(getRowOS(obj), OS_NAMES),
      type: TemplateFilterType.OSName,
    }),
    [t],
  );
};

export default useOSFilter;
