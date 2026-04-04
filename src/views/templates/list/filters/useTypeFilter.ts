import { useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isOpenShiftTemplate, TemplateOrRequest } from '@kubevirt-utils/resources/template';
import { includeFilter } from '@kubevirt-utils/utils/utils';
import { RowFilter, RowFilterItem } from '@openshift-console/dynamic-plugin-sdk';

const TEMPLATE_TYPE = {
  OPENSHIFT: 'templates',
  VM: 'vm-templates',
} as const;

const getTemplateType = (obj: TemplateOrRequest): string => {
  if (isOpenShiftTemplate(obj)) {
    return TEMPLATE_TYPE.OPENSHIFT;
  }
  return TEMPLATE_TYPE.VM;
};

const useTypeFilter = (): RowFilter<TemplateOrRequest> => {
  const { t } = useKubevirtTranslation();

  const typeFilterItems: RowFilterItem[] = useMemo(
    () => [
      {
        id: TEMPLATE_TYPE.OPENSHIFT,
        title: t('OpenShift templates'),
      },
      {
        id: TEMPLATE_TYPE.VM,
        title: t('VirtualMachine templates'),
      },
    ],
    [t],
  );

  return useMemo(
    () => ({
      filter: (types, obj) => includeFilter(types, typeFilterItems, getTemplateType(obj)),
      filterGroupName: t('Type'),
      items: typeFilterItems,
      reducer: (obj) => getTemplateType(obj),
      type: 'type',
    }),
    [typeFilterItems, t],
  );
};

export default useTypeFilter;
