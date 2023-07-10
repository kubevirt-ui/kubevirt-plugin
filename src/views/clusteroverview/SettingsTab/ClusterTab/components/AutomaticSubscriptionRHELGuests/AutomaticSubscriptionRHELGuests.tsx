import React, { FC } from 'react';

import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Stack } from '@patternfly/react-core';

import ExpandSection from '../../../ExpandSection/ExpandSection';

import AutomaticSubscriptionForm from './components/AutomaticSubscriptionForm/AutomaticSubscriptionForm';

const AutomaticSubscriptionRHELGuests: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <ExpandSection toggleText={t('Automatic subscription of new RHEL VirtualMachines')}>
      <Stack>
        <MutedTextSpan
          text={t('Enable automatic subscription for Red Hat Enterprise Linux VirtualMachines.\n')}
        />
        <MutedTextSpan
          text={t('Cluster administrator permissions are required to enable this feature.')}
        />
        <AutomaticSubscriptionForm />
      </Stack>
    </ExpandSection>
  );
};

export default AutomaticSubscriptionRHELGuests;
