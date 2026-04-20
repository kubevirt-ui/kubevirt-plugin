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

const useTypeFilter = (featureEnabled: boolean): null | RowFilter<TemplateOrRequest> => {
  const { t } = useKubevirtTranslation();

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
      id: TEMPLATE_TYPE.OPENSHIFT,
      title: openShiftTemplateTitle,
    },
    {
      content: (
        <>
          <ResourceIcon groupVersionKind={VirtualMachineTemplateGroupVersionKind} />
          {virtualMachineTemplateTitle}
        </>
      ),
      id: TEMPLATE_TYPE.VM,
      title: virtualMachineTemplateTitle,
    },
  ];

  return useMemo(() => {
    if (!featureEnabled) return null;

    return {
      filter: (types, obj) => includeFilter(types, typeFilterItems, getTemplateType(obj)),
      filterGroupName: t('Type'),
      items: typeFilterItems,
      reducer: (obj) => getTemplateType(obj),
      type: 'type',
    };
  }, [featureEnabled, typeFilterItems, t]);
};

export default useTypeFilter;
