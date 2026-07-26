import React, { FC } from 'react';

import NewBadge from '@kubevirt-utils/components/badges/NewBadge/NewBadge';
import ExpandSectionWithCustomToggle from '@kubevirt-utils/components/ExpandSectionWithCustomToggle/ExpandSectionWithCustomToggle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { CLUSTER_TAB_IDS } from '@settings/search/constants';

import AutoAppliedLabelsTable from './AutoAppliedLabelsTable';

const AutoAppliedLabelsSection: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <ExpandSectionWithCustomToggle
      customContent={<NewBadge />}
      helpTextContent={t(
        'Define label keys that are automatically applied to new VirtualMachines. Set default values and mark keys as required.',
      )}
      id={CLUSTER_TAB_IDS.autoAppliedLabels}
      isIndented
      searchItemId={CLUSTER_TAB_IDS.autoAppliedLabels}
      toggleClassname="ExpandSection"
      toggleContent={t('Auto-applied VM labels')}
    >
      <AutoAppliedLabelsTable />
    </ExpandSectionWithCustomToggle>
  );
};

export default AutoAppliedLabelsSection;
