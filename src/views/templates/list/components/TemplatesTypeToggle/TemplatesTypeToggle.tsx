import React, { type FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useUniversalFilter from '@kubevirt-utils/hooks/useUniversalFilter/useUniversalFilter';
import useIsVMTemplateFeatureEnabled from '@kubevirt-utils/hooks/useVMTemplateFeatureFlag/useIsVMTemplateFeatureEnabled';
import { type OnFilterChange } from '@openshift-console/dynamic-plugin-sdk';
import { ToggleGroup, ToggleGroupItem } from '@patternfly/react-core';
import { TEMPLATE_TYPE_ID } from '@templates/list/filters/constants';
import { TemplateFilterType } from '@templates/list/filters/types';

import './templates-type-toggle.scss';

type TemplatesTypeToggleProps = {
  onFilterChange: OnFilterChange;
};

const TemplatesTypeToggle: FC<TemplatesTypeToggleProps> = ({ onFilterChange }) => {
  const { t } = useKubevirtTranslation();
  const { featureEnabled: vmTemplatesEnabled } = useIsVMTemplateFeatureEnabled();
  const { hasQueryKey, isSelected, setValue } = useUniversalFilter({ onFilterChange });

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
