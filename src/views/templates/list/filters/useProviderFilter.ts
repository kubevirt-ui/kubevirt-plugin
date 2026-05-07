import { useMemo } from 'react';

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
import { getItemNameWithOther, includeFilter } from '@kubevirt-utils/utils/utils';
import { RowFilter, RowFilterItem } from '@openshift-console/dynamic-plugin-sdk';

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

const useProviderFilter = (): RowFilter<TemplateOrRequest> => {
  const { t } = useKubevirtTranslation();

  const providers: RowFilterItem[] = useMemo(
    () => [
      {
        id: PROVIDER_ID.RED_HAT,
        title: t('Red Hat'),
      },
      {
        id: PROVIDER_ID.OTHER,
        title: t('Other'),
      },
    ],
    [t],
  );

  return useMemo(
    () => ({
      filter: (availableTemplateProviders, obj) =>
        !isOpenShiftTemplate(obj) ||
        includeFilter(availableTemplateProviders, providers, getRowProvider(obj)),
      filterGroupName: t('Provider'),
      items: providers,
      reducer: (obj) => getItemNameWithOther(getRowProvider(obj), providers),
      type: TemplateFilterType.Provider,
    }),
    [providers, t],
  );
};

export default useProviderFilter;
