import React, { FC } from 'react';

import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { CLUSTER_TAB_IDS } from '@overview/SettingsTab/search/constants';
import { Stack, StackItem } from '@patternfly/react-core';

import ExpandSection from '../../../ExpandSection/ExpandSection';

import AutomaticSubscriptionRHELGuests from './AutomaticSubscriptionRHELGuests/AutomaticSubscriptionRHELGuests';
import GuestSystemLogsAccess from './GuestSystemLogsAccess/GuestSystemLogsAccess';
import HideCredentials from './HideCredentials/HideCredentials';

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
    <ExpandSection
      searchItemId={CLUSTER_TAB_IDS.guestManagement}
      toggleText={t('Guest management')}
    >
      <Stack hasGutter>
        <StackItem isFilled>
          <GuestSystemLogsAccess
            hyperConvergeConfiguration={hyperConvergeConfiguration}
            newBadge={newBadge}
          />
        </StackItem>
        <StackItem isFilled>
          <HideCredentials newBadge={newBadge} />
        </StackItem>
        <StackItem isFilled>
          <AutomaticSubscriptionRHELGuests newBadge={newBadge} />
        </StackItem>
      </Stack>
    </ExpandSection>
  );
};

export default GuestManagementSection;
