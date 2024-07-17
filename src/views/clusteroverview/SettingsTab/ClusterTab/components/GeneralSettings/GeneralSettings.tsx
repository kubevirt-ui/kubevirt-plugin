import React, { FC } from 'react';

import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-utils/models';
import { K8sResourceCommon, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Stack, StackItem } from '@patternfly/react-core';

import ExpandSection from '../../../ExpandSection/ExpandSection';

import AutomaticImagesDownload from './AutomaticImagesDownload/AutomaticImagesDownload';
import BootableVolumeProjectSection from './BootableVolumeProjectSection/BootableVolumeProjectSection';
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
  const projectsData = useK8sWatchResource<K8sResourceCommon[]>({
    groupVersionKind: modelToGroupVersionKind(ProjectModel),
    isList: true,
  });

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
          <TemplatesProjectSection
            hyperConvergeConfiguration={hyperConvergeConfiguration}
            projectsData={projectsData}
          />
        </StackItem>
        <StackItem isFilled>
          <BootableVolumeProjectSection
            hyperConvergeConfiguration={hyperConvergeConfiguration}
            projectsData={projectsData}
          />
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
