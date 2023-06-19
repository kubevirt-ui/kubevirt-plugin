import React, { FC } from 'react';

import EnableFeatureCheckbox from '@kubevirt-utils/components/EnableFeatureCheckbox/EnableFeatureCheckbox';
import { LOAD_BALANCER_ENABLED } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import ExpandSection from '../../../ExpandSection/ExpandSection';

const EnableLoadBalancerSection: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <ExpandSection toggleText={t('LoadBalancer')}>
      <EnableFeatureCheckbox
        description={t('A LoadBalancer must be available in the cluster')}
        featureName={LOAD_BALANCER_ENABLED}
        id="load-balancer-feature"
        label={t('Enable the creation of SSH service over LoadBalancer for VirtualMachines')}
      />
    </ExpandSection>
  );
};

export default EnableLoadBalancerSection;
