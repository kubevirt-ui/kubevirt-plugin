import { useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getLabel } from '@kubevirt-utils/resources/shared';
import {
  isVirtualMachineTemplateRequest,
  TEMPLATE_TYPE_BASE,
  TEMPLATE_TYPE_LABEL,
  TemplateOrRequest,
} from '@kubevirt-utils/resources/template';
import { OTHER } from '@kubevirt-utils/utils/constants';
import { getItemNameWithOther, includeFilter } from '@kubevirt-utils/utils/utils';
import { RowFilter, RowFilterItem } from '@openshift-console/dynamic-plugin-sdk';

import { getTemplateProviderName } from '../../utils/selectors';

const RED_HAT = 'Red Hat';

const isBaseTemplate = (obj: TemplateOrRequest): boolean =>
  getLabel(obj, TEMPLATE_TYPE_LABEL) === TEMPLATE_TYPE_BASE;

const getRowProvider = (obj: TemplateOrRequest): string => {
  if (isVirtualMachineTemplateRequest(obj)) return OTHER;

  const provider = getTemplateProviderName(obj);
  if (provider) {
    return provider.startsWith(RED_HAT) ? RED_HAT : provider;
  }

  if (isBaseTemplate(obj)) return RED_HAT;

  return OTHER;
};

const useProviderFilter = (): RowFilter<TemplateOrRequest> => {
  const { t } = useKubevirtTranslation();

  const providers: RowFilterItem[] = useMemo(
    () => [
      {
        id: 'Red Hat',
        title: t('Red Hat'),
      },
      {
        id: 'Other',
        title: t('Other'),
      },
    ],
    [t],
  );

  return useMemo(
    () => ({
      filter: (availableTemplateProviders, obj) =>
        includeFilter(availableTemplateProviders, providers, getRowProvider(obj)),
      filterGroupName: t('Provider'),
      items: providers,
      reducer: (obj) => getItemNameWithOther(getRowProvider(obj), providers),
      type: 'provider',
    }),
    [providers, t],
  );
};

export default useProviderFilter;
