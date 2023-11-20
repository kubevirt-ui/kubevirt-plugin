import React, { FC } from 'react';

import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Stack, StackItem } from '@patternfly/react-core';

import ExpandSection from '../../../ExpandSection/ExpandSection';

import AutomaticSubscriptionRHELGuests from './AutomaticSubscriptionRHELGuests/AutomaticSubscriptionRHELGuests';
import GuestSystemLogsAccess from './GuestSystemLogsAccess/GuestSystemLogsAccess';

type GuestManagementSectionProps = {
  hyperConvergeConfiguration: [hyperConvergeConfig: HyperConverged, loaded: boolean, error: any];
  newBadge?: boolean;
};

const GuestManagementSection: FC<GuestManagementSectionProps> = ({
  hyperConvergeConfiguration,
  newBadge,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <ExpandSection toggleText={t('Guest management')}>
      <Stack hasGutter>
        <StackItem isFilled>
          <AutomaticSubscriptionRHELGuests newBadge={newBadge} />
        </StackItem>
        <StackItem isFilled>
          <GuestSystemLogsAccess
            hyperConvergeConfiguration={hyperConvergeConfiguration}
            newBadge={newBadge}
          />
        </StackItem>
      </Stack>
    </ExpandSection>
  );
};

export default GuestManagementSection;
