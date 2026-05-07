import React, { useMemo } from 'react';

import { ExtendedRowFilterItem } from '@kubevirt-utils/components/ListPageFilter/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isOpenShiftTemplate, TemplateOrRequest } from '@kubevirt-utils/resources/template';
import {
  TemplateModelGroupVersionKind,
  VirtualMachineTemplateGroupVersionKind,
} from '@kubevirt-utils/resources/template/hooks/constants';
import { includeFilter } from '@kubevirt-utils/utils/utils';
import { ResourceIcon, RowFilter } from '@openshift-console/dynamic-plugin-sdk';

import { TemplateFilterType } from './types';

const TEMPLATE_TYPE_ID = {
  OPENSHIFT: 'templates',
  VM: 'vm-templates',
} as const;

const getTemplateType = (obj: TemplateOrRequest): string => {
  if (isOpenShiftTemplate(obj)) {
    return TEMPLATE_TYPE_ID.OPENSHIFT;
  }
  return TEMPLATE_TYPE_ID.VM;
};

const useTypeFilter = (featureEnabled: boolean): null | RowFilter<TemplateOrRequest> => {
  const { t } = useKubevirtTranslation();

  return useMemo(() => {
    if (!featureEnabled) return null;

    const openShiftTemplateTitle = t('OpenShift templates');
    const virtualMachineTemplateTitle = t('VirtualMachine templates');

    const typeFilterItems: ExtendedRowFilterItem[] = [
      {
        content: (
          <>
            <ResourceIcon groupVersionKind={TemplateModelGroupVersionKind} />
            {openShiftTemplateTitle}
          </>
        ),
        id: TEMPLATE_TYPE_ID.OPENSHIFT,
        title: openShiftTemplateTitle,
      },
      {
        content: (
          <>
            <ResourceIcon groupVersionKind={VirtualMachineTemplateGroupVersionKind} />
            {virtualMachineTemplateTitle}
          </>
        ),
        id: TEMPLATE_TYPE_ID.VM,
        title: virtualMachineTemplateTitle,
      },
    ];

    return {
      filter: (types, obj) => includeFilter(types, typeFilterItems, getTemplateType(obj)),
      filterGroupName: t('Type'),
      items: typeFilterItems,
      reducer: (obj) => getTemplateType(obj),
      type: TemplateFilterType.Type,
    };
  }, [featureEnabled, t]);
};

export default useTypeFilter;
