import React, { FCC } from 'react';

import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-utils/models';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { Stack, StackItem } from '@patternfly/react-core';
import { useSettingsCluster } from '@settings/context/SettingsClusterContext';
import ExpandSection from '@settings/ExpandSection/ExpandSection';
import { CLUSTER_TAB_IDS } from '@settings/search/constants';
import AutomaticImagesDownload from '@settings/tabs/ClusterTab/components/GeneralSettings/TemplatesAndImagesManagement/components/AutomaticImagesDownload/AutomaticImagesDownload';
import BootableVolumeProjectSection from '@settings/tabs/ClusterTab/components/GeneralSettings/TemplatesAndImagesManagement/components/BootableVolumeProjectSection/BootableVolumeProjectSection';
import TemplatesProjectSection from '@settings/tabs/ClusterTab/components/GeneralSettings/TemplatesAndImagesManagement/components/TemplatesProjectSection/TemplatesProjectSection';

type TemplatesAndImagesManagementProps = {
  hyperConvergeConfiguration: [hyperConvergeConfig: HyperConverged, loaded: boolean, error: any];
  newBadge?: boolean;
};

const TemplatesAndImagesManagement: FCC<TemplatesAndImagesManagementProps> = ({
  hyperConvergeConfiguration,
  newBadge,
}) => {
  const { t } = useKubevirtTranslation();
  const cluster = useSettingsCluster();
  const projectsData = useK8sWatchData<K8sResourceCommon[]>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(ProjectModel),
    isList: true,
  });

  return (
    <ExpandSection
      searchItemId={CLUSTER_TAB_IDS.templatesManagement}
      toggleText={t('Templates and images management')}
    >
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
