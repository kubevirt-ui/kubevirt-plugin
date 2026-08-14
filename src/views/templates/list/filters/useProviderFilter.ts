import { useMemo } from 'react';

import { KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getLabel } from '@kubevirt-utils/resources/shared';
import {
  isOpenShiftTemplate,
  isVirtualMachineTemplateRequest,
  TEMPLATE_TYPE_BASE,
  TEMPLATE_TYPE_LABEL,
  TemplateOrRequest,
} from '@kubevirt-utils/resources/template';
import { OTHER } from '@kubevirt-utils/utils/constants';

import { getTemplateProviderName } from '../../utils/selectors';

import { TemplateFilterType } from './types';

const PROVIDER_ID = {
  OTHER: 'Other',
  RED_HAT: 'Red Hat',
} as const;

const isBaseTemplate = (obj: TemplateOrRequest): boolean =>
  getLabel(obj, TEMPLATE_TYPE_LABEL) === TEMPLATE_TYPE_BASE;

const getRowProvider = (obj: TemplateOrRequest): string => {
  if (isVirtualMachineTemplateRequest(obj)) return OTHER;

  const provider = getTemplateProviderName(obj);
  if (provider) {
    return provider.startsWith(PROVIDER_ID.RED_HAT) ? PROVIDER_ID.RED_HAT : provider;
  }

  if (isBaseTemplate(obj)) return PROVIDER_ID.RED_HAT;

  return OTHER;
};

const useProviderFilter = (): KubevirtFilter<TemplateOrRequest> => {
  const { t } = useKubevirtTranslation();

  return useMemo(
    () => ({
      categoryLabel: t('Provider'),
      id: TemplateFilterType.Provider,
      match: (obj, selected) => !isOpenShiftTemplate(obj) || selected.includes(getRowProvider(obj)),
      options: [
        { label: t('Red Hat'), value: PROVIDER_ID.RED_HAT },
        { label: t('Other'), value: PROVIDER_ID.OTHER },
      ],
    }),
    [t],
  );
};

export default useProviderFilter;
