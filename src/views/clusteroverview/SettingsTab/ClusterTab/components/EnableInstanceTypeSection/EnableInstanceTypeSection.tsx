import React, { FC } from 'react';

import EnableFeatureCheckbox from '@kubevirt-utils/components/EnableFeatureCheckbox/EnableFeatureCheckbox';
import { INSTANCE_TYPE_ENABLED } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import ExpandSection from '../../../ExpandSection/ExpandSection';

const EnableInstanceTypeSection: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <ExpandSection toggleText={t('Preview features')}>
      <EnableFeatureCheckbox
        featureName={INSTANCE_TYPE_ENABLED}
        id="tp-instance-type"
        label={t('Enable create VirtualMachine from InstanceType')}
      />
    </ExpandSection>
  );
};

export default EnableInstanceTypeSection;
