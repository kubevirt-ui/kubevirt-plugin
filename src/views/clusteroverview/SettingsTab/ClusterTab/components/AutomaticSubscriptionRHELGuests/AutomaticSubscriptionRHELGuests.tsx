import React, { FC } from 'react';

import EnableFeatureCheckbox from '@kubevirt-utils/components/EnableFeatureCheckbox/EnableFeatureCheckbox';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Stack } from '@patternfly/react-core';

import ExpandSection from '../../../ExpandSection/ExpandSection';

import AutomaticSubscriptionForm from './components/AutomaticSubscriptionForm/AutomaticSubscriptionForm';
import { AUTOMATIC_UPDATE_FEATURE_NAME } from './utils/constants';

const AutomaticSubscriptionRHELGuests: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <ExpandSection toggleText={t('Automatic subscription of new RHEL VirtualMachines')}>
      <Stack hasGutter>
        <MutedTextSpan
          text={t('Enable automatic subscription for Red Hat Enterprise Linux VirtualMachines.\n')}
        />
        <MutedTextSpan
          text={t('Cluster administrator permissions are required to enable this feature.')}
        />
        <AutomaticSubscriptionForm />
        <EnableFeatureCheckbox
          featureName={AUTOMATIC_UPDATE_FEATURE_NAME}
          helpText={t('Automatically pull updates from the RHEL repository')}
          id={AUTOMATIC_UPDATE_FEATURE_NAME}
          label={t('Enable auto updates for RHEL VirtualMachines')}
        />
      </Stack>
    </ExpandSection>
  );
};

export default AutomaticSubscriptionRHELGuests;
