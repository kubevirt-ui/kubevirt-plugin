import React, { FC } from 'react';

import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-utils/models';
import { K8sResourceCommon, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import AutomaticImagesDownload from '@overview/SettingsTab/ClusterTab/components/GeneralSettings/TemplatesAndImagesManagement/components/AutomaticImagesDownload/AutomaticImagesDownload';
import BootableVolumeProjectSection from '@overview/SettingsTab/ClusterTab/components/GeneralSettings/TemplatesAndImagesManagement/components/BootableVolumeProjectSection/BootableVolumeProjectSection';
import TemplatesProjectSection from '@overview/SettingsTab/ClusterTab/components/GeneralSettings/TemplatesAndImagesManagement/components/TemplatesProjectSection/TemplatesProjectSection';
import ExpandSection from '@overview/SettingsTab/ExpandSection/ExpandSection';
import { Stack, StackItem } from '@patternfly/react-core';

type TemplatesAndImagesManagementProps = {
  hyperConvergeConfiguration: [hyperConvergeConfig: HyperConverged, loaded: boolean, error: any];
  newBadge?: boolean;
};

const TemplatesAndImagesManagement: FC<TemplatesAndImagesManagementProps> = ({
  hyperConvergeConfiguration,
  newBadge,
}) => {
  const { t } = useKubevirtTranslation();
  const projectsData = useK8sWatchResource<K8sResourceCommon[]>({
    groupVersionKind: modelToGroupVersionKind(ProjectModel),
    isList: true,
  });

  return (
    <ExpandSection toggleText={t('Templates and images management')}>
      <Stack hasGutter>
        <StackItem>
          <AutomaticImagesDownload
            hyperConvergeConfiguration={hyperConvergeConfiguration}
            newBadge={newBadge}
          />
        </StackItem>
        <StackItem isFilled>
          <BootableVolumeProjectSection
            hyperConvergeConfiguration={hyperConvergeConfiguration}
            projectsData={projectsData}
          />
        </StackItem>
        <StackItem isFilled>
          <TemplatesProjectSection
            hyperConvergeConfiguration={hyperConvergeConfiguration}
            projectsData={projectsData}
          />
        </StackItem>
      </Stack>
    </ExpandSection>
  );
};

export default TemplatesAndImagesManagement;
