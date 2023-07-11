import React, { FC } from 'react';

import EnableFeatureCheckbox from '@kubevirt-utils/components/EnableFeatureCheckbox/EnableFeatureCheckbox';
import { LOAD_BALANCER_ENABLED } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import ExpandSection from '../../../ExpandSection/ExpandSection';

const EnableLoadBalancerSection: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <ExpandSection toggleText={t('LoadBalancer service')}>
      <EnableFeatureCheckbox
        label={t(
          'Enable the creation of LoadBalancer services for SSH connections to VirtualMachines',
        )}
        description={t('A load balancer must be configured')}
        featureName={LOAD_BALANCER_ENABLED}
        id="load-balancer-feature"
      />
    </ExpandSection>
  );
};

export default EnableLoadBalancerSection;
