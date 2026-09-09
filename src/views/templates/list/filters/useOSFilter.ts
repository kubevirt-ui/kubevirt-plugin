import { useMemo } from 'react';

import useIsWindowsSupportedArchitecture from '@kubevirt-utils/hooks/useIsWindowsSupportedArchitecture';
import { type KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
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
    return OS_NAME_TYPES.Other;
  }

  return getTemplateOS(obj);
};

const useOSFilter = (): KubevirtFilter<TemplateOrRequest> => {
  const { t } = useKubevirtTranslation();
  const isWindowsSupported = useIsWindowsSupportedArchitecture();

  return useMemo(
    () => ({
      categoryLabel: t('Operating system'),
      id: TemplateFilterType.OSName,
      match: (obj, selected) => selected.includes(getRowOS(obj)),
      options: OS_NAMES.reduce<Array<{ label: string; value: string }>>((acc, { id, title }) => {
        if (isWindowsSupported || id !== OS_NAME_TYPES.Windows) {
          acc.push({ label: title, value: id });
        }
        return acc;
      }, []),
    }),
    [isWindowsSupported, t],
  );
};

export default useOSFilter;
