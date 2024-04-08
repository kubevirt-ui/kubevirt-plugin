import React, { FC } from 'react';

import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Stack, StackItem } from '@patternfly/react-core';

import ExpandSection from '../../../ExpandSection/ExpandSection';

import AutomaticImagesDownload from './AutomaticImagesDownload/AutomaticImagesDownload';
import LiveMigrationSection from './LiveMigrationSection/LiveMigrationSection';
import MemoryDensity from './MemoryDensity/MemoryDensity';
import SSHConfiguration from './SSHConfiguration/SSHConfiguration';
import TemplatesProjectSection from './TemplatesProjectSection/TemplatesProjectSection';

type GeneralSettingsProps = {
  hyperConvergeConfiguration: [hyperConvergeConfig: HyperConverged, loaded: boolean, error: any];
  newBadge?: boolean;
};

const GeneralSettings: FC<GeneralSettingsProps> = ({ hyperConvergeConfiguration, newBadge }) => {
  const { t } = useKubevirtTranslation();

  return (
    <ExpandSection toggleText={t('General settings')}>
      <Stack hasGutter>
        <StackItem isFilled>
          <LiveMigrationSection hyperConvergeConfiguration={hyperConvergeConfiguration} />
        </StackItem>
        <StackItem isFilled>
          <SSHConfiguration newBadge={newBadge} />
        </StackItem>
        <StackItem isFilled>
          <TemplatesProjectSection hyperConvergeConfiguration={hyperConvergeConfiguration} />
        </StackItem>
        <StackItem isFilled>
          <MemoryDensity
            hyperConvergeConfiguration={hyperConvergeConfiguration}
            newBadge={newBadge}
          />
        </StackItem>
        <StackItem>
          <AutomaticImagesDownload
            hyperConvergeConfiguration={hyperConvergeConfiguration}
            newBadge={newBadge}
          />
        </StackItem>
      </Stack>
    </ExpandSection>
  );
};
export default GeneralSettings;
