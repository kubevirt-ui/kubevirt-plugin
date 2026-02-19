import React, { FC } from 'react';

import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import TemplatesAndImagesManagement from '@overview/SettingsTab/ClusterTab/components/GeneralSettings/TemplatesAndImagesManagement/TemplatesAndImagesManagement';
import VMActionsConfirmation from '@overview/SettingsTab/ClusterTab/components/GeneralSettings/VMActionsConfirmation/VMActionsConfirmation';
import { CLUSTER_TAB_IDS } from '@overview/SettingsTab/search/constants';
import { Stack, StackItem } from '@patternfly/react-core';

import ExpandSection from '../../../ExpandSection/ExpandSection';

import HideYamlTab from './HideYamlTab/HideYamlTab';
import LiveMigrationSection from './LiveMigrationSection/LiveMigrationSection';
import MemoryDensity from './MemoryDensity/MemoryDensity';
import SSHConfiguration from './SSHConfiguration/SSHConfiguration';

type GeneralSettingsProps = {
  hyperConvergeConfiguration: [hyperConvergeConfig: HyperConverged, loaded: boolean, error: any];
  newBadge?: boolean;
};

const GeneralSettings: FC<GeneralSettingsProps> = ({ hyperConvergeConfiguration, newBadge }) => {
  const { t } = useKubevirtTranslation();

  return (
    <ExpandSection
      searchItemId={CLUSTER_TAB_IDS.generalSettings}
      toggleText={t('General settings')}
    >
      <Stack hasGutter>
        <StackItem isFilled>
          <LiveMigrationSection hyperConvergeConfiguration={hyperConvergeConfiguration} />
        </StackItem>
        <StackItem isFilled>
          <MemoryDensity
            hyperConvergeConfiguration={hyperConvergeConfiguration}
            newBadge={newBadge}
          />
        </StackItem>
        <StackItem isFilled>
          <SSHConfiguration newBadge={newBadge} />
        </StackItem>
        <StackItem isFilled>
          <TemplatesAndImagesManagement
            hyperConvergeConfiguration={hyperConvergeConfiguration}
            newBadge={newBadge}
          />
        </StackItem>
        <StackItem isFilled>
          <VMActionsConfirmation newBadge={newBadge} />
        </StackItem>
        <StackItem isFilled>
          <HideYamlTab newBadge={newBadge} />
        </StackItem>
      </Stack>
    </ExpandSection>
  );
};
export default GeneralSettings;
