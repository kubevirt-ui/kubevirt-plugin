import React, { type FC, useMemo } from 'react';

import RequiredCountBadge from '@kubevirt-utils/components/badges/RequiredCountBadge/RequiredCountBadge';
import ExpandSectionWithCustomToggle from '@kubevirt-utils/components/ExpandSectionWithCustomToggle/ExpandSectionWithCustomToggle';
import useAutoAppliedLabels from '@kubevirt-utils/hooks/useAutoAppliedLabels/useAutoAppliedLabels';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { USER_TAB_IDS } from '@settings/search/constants';

import DefaultVMLabelsTable from './DefaultVMLabelsTable';

const DefaultVMLabelsSection: FC = () => {
  const { t } = useKubevirtTranslation();
  const { labels } = useAutoAppliedLabels();
  const requiredLabels = useMemo(() => labels.filter((label) => label.required), [labels]);

  return (
    <ExpandSectionWithCustomToggle
      customContent={<RequiredCountBadge count={requiredLabels.length} />}
      helpTextContent={t(
        'Shows the label keys configured by your administrator. You can set values for keys the administrator left empty.',
      )}
      id={USER_TAB_IDS.defaultVMLabels}
      isIndented
      searchItemId={USER_TAB_IDS.defaultVMLabels}
      toggleClassname="ExpandSection"
      toggleContent={t('Default VM labels')}
    >
      <DefaultVMLabelsTable />
    </ExpandSectionWithCustomToggle>
  );
};

export default DefaultVMLabelsSection;
