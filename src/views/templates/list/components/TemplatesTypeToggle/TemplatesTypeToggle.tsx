import React, { type FC } from 'react';

import {
  KubevirtFilterState,
  OnSetFilters,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useUniversalFilter, {
  type UniversalFilter,
} from '@kubevirt-utils/hooks/useUniversalFilter/useUniversalFilter';
import useIsVMTemplateFeatureEnabled from '@kubevirt-utils/hooks/useVMTemplateFeatureFlag/useIsVMTemplateFeatureEnabled';
import { ToggleGroup, ToggleGroupItem } from '@patternfly/react-core';
import { TEMPLATE_TYPE_ID } from '@templates/list/filters/constants';
import { TemplateFilterType } from '@templates/list/filters/types';

import './templates-type-toggle.scss';

type TemplatesTypeToggleProps = {
  filters: KubevirtFilterState;
  onSetFilters: OnSetFilters;
};

const TemplatesTypeToggle: FC<TemplatesTypeToggleProps> = ({ filters, onSetFilters }) => {
  const { t } = useKubevirtTranslation();
  const { featureEnabled: vmTemplatesEnabled } = useIsVMTemplateFeatureEnabled();
  const { hasQueryKey, isSelected, setValue }: UniversalFilter = useUniversalFilter({
    filters,
    onSetFilters,
  });

  if (!vmTemplatesEnabled) {
    return null;
  }

  const isAllSelected = !hasQueryKey(TemplateFilterType.Type);
  const isOpenShiftSelected = isSelected(TemplateFilterType.Type, TEMPLATE_TYPE_ID.OPENSHIFT);
  const isVirtualMachineSelected = isSelected(TemplateFilterType.Type, TEMPLATE_TYPE_ID.VM);

  return (
    <ToggleGroup aria-label={t('Template type')} className="templates-type-toggle">
      <ToggleGroupItem
        buttonId="templates-type-all"
        isSelected={isAllSelected}
        onChange={() => setValue(TemplateFilterType.Type, null)}
        text={t('All templates')}
      />
      <ToggleGroupItem
        buttonId="templates-type-openshift"
        isSelected={isOpenShiftSelected}
        onChange={() => setValue(TemplateFilterType.Type, TEMPLATE_TYPE_ID.OPENSHIFT)}
        text={t('OpenShift templates')}
      />
      <ToggleGroupItem
        buttonId="templates-type-vm"
        isSelected={isVirtualMachineSelected}
        onChange={() => setValue(TemplateFilterType.Type, TEMPLATE_TYPE_ID.VM)}
        text={t('VirtualMachine templates')}
      />
    </ToggleGroup>
  );
};

export default TemplatesTypeToggle;
