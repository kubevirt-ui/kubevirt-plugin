import { useMemo } from 'react';

import { KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  getTemplateOS,
  isVirtualMachineTemplateRequest,
  OS_NAME_TYPES,
  OS_NAMES,
  type TemplateOrRequest,
} from '@kubevirt-utils/resources/template';

import { TemplateFilterType } from './types';

const getRowOS = (obj: TemplateOrRequest): string => {
  if (isVirtualMachineTemplateRequest(obj)) {
    return OS_NAME_TYPES.other;
  }

  return getTemplateOS(obj);
};

const useOSFilter = (): KubevirtFilter<TemplateOrRequest> => {
  const { t } = useKubevirtTranslation();

  return useMemo(
    () => ({
      categoryLabel: t('Operating system'),
      id: TemplateFilterType.OSName,
      match: (obj, selected) => selected.includes(getRowOS(obj)),
      options: OS_NAMES.map(({ id, title }) => ({ label: title, value: id })),
    }),
    [t],
  );
};

export default useOSFilter;
