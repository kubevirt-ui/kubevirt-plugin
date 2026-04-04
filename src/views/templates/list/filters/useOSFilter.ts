import { useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  getTemplateOS,
  isVirtualMachineTemplateRequest,
  OS_NAME_TYPES,
  OS_NAMES,
  TemplateOrRequest,
} from '@kubevirt-utils/resources/template';
import { getItemNameWithOther, includeFilter } from '@kubevirt-utils/utils/utils';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';

const getRowOS = (obj: TemplateOrRequest): string =>
  isVirtualMachineTemplateRequest(obj) ? OS_NAME_TYPES.other : getTemplateOS(obj);

const useOSFilter = (): RowFilter<TemplateOrRequest> => {
  const { t } = useKubevirtTranslation();

  return useMemo(
    () => ({
      filter: (availableOsNames, obj) => includeFilter(availableOsNames, OS_NAMES, getRowOS(obj)),
      filterGroupName: t('Operating system'),
      items: OS_NAMES,
      reducer: (obj) => getItemNameWithOther(getRowOS(obj), OS_NAMES),
      type: 'osName',
    }),
    [t],
  );
};

export default useOSFilter;
