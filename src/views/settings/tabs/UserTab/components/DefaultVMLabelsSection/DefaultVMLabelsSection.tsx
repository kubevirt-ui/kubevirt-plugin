import React, { FC } from 'react';

import NewBadge from '@kubevirt-utils/components/badges/NewBadge/NewBadge';
import ExpandSectionWithCustomToggle from '@kubevirt-utils/components/ExpandSectionWithCustomToggle/ExpandSectionWithCustomToggle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { USER_TAB_IDS } from '@settings/search/constants';

import DefaultVMLabelsTable from './DefaultVMLabelsTable';

const DefaultVMLabelsSection: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <ExpandSectionWithCustomToggle
      customContent={<NewBadge />}
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
