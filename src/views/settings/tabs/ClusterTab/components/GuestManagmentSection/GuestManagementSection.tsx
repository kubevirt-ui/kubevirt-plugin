import { type FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Stack, StackItem } from '@patternfly/react-core';
import ExpandSection from '@settings/ExpandSection/ExpandSection';
import { CLUSTER_TAB_IDS } from '@settings/search/constants';

import { type HyperConvergeConfigurationWatch } from '../GeneralSettings/consts/types';
import AutomaticSubscriptionRHELGuests from './AutomaticSubscriptionRHELGuests/AutomaticSubscriptionRHELGuests';
import GuestSystemLogsAccess from './GuestSystemLogsAccess/GuestSystemLogsAccess';
import HideCredentials from './HideCredentials/HideCredentials';

type GuestManagementSectionProps = {
  hyperConvergeConfiguration: HyperConvergeConfigurationWatch;
  newBadge?: boolean;
};

const GuestManagementSection: FC<GuestManagementSectionProps> = ({
  hyperConvergeConfiguration,
  newBadge,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <ExpandSection
      dataTestID="guest-management"
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
