import React, { useMemo } from 'react';

import { KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useIsVMTemplateFeatureEnabled from '@kubevirt-utils/hooks/useVMTemplateFeatureFlag/useIsVMTemplateFeatureEnabled';
import { isOpenShiftTemplate, TemplateOrRequest } from '@kubevirt-utils/resources/template';
import {
  TemplateModelGroupVersionKind,
  VirtualMachineTemplateGroupVersionKind,
} from '@kubevirt-utils/resources/template/hooks/constants';
import { ResourceIcon } from '@openshift-console/dynamic-plugin-sdk';

import { TEMPLATE_TYPE_ID } from './constants';
import { TemplateFilterType } from './types';

const getTemplateType = (obj: TemplateOrRequest): string => {
  if (isOpenShiftTemplate(obj)) {
    return TEMPLATE_TYPE_ID.OPENSHIFT;
  }
  return TEMPLATE_TYPE_ID.VM;
};

const useTypeFilter = (): KubevirtFilter<TemplateOrRequest> | null => {
  const { t } = useKubevirtTranslation();
  const { featureEnabled: vmTemplatesEnabled } = useIsVMTemplateFeatureEnabled();

  return useMemo(() => {
    if (!vmTemplatesEnabled) return null;

    const openShiftTemplateTitle = t('OpenShift templates');
    const virtualMachineTemplateTitle = t('VirtualMachine templates');

    return {
      categoryLabel: t('Type'),
      id: TemplateFilterType.Type,
      match: (obj, selected) => selected.includes(getTemplateType(obj)),
      options: [
        {
          label: (
            <>
              <ResourceIcon groupVersionKind={TemplateModelGroupVersionKind} />
              {openShiftTemplateTitle}
            </>
          ),
          value: TEMPLATE_TYPE_ID.OPENSHIFT,
        },
        {
          label: (
            <>
              <ResourceIcon groupVersionKind={VirtualMachineTemplateGroupVersionKind} />
              {virtualMachineTemplateTitle}
            </>
          ),
          value: TEMPLATE_TYPE_ID.VM,
        },
      ],
    };
  }, [vmTemplatesEnabled, t]);
};

export default useTypeFilter;
