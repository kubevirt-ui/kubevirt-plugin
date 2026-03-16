import React, { FC } from 'react';

import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Stack, StackItem } from '@patternfly/react-core';
import ExpandSection from '@settings/ExpandSection/ExpandSection';
import { CLUSTER_TAB_IDS } from '@settings/search/constants';
import TemplatesAndImagesManagement from '@settings/tabs/ClusterTab/components/GeneralSettings/TemplatesAndImagesManagement/TemplatesAndImagesManagement';
import VMActionsConfirmation from '@settings/tabs/ClusterTab/components/GeneralSettings/VMActionsConfirmation/VMActionsConfirmation';

import AdvancedCDROMFeatures from './AdvancedCDROMFeatures/AdvancedCDROMFeatures';
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
        <StackItem isFilled>
          <AdvancedCDROMFeatures newBadge={newBadge} />
        </StackItem>
      </Stack>
    </ExpandSection>
  );
};
export default GeneralSettings;
