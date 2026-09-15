import { type FC } from 'react';

import { OPENSHIFT_OS_IMAGES_NS } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { CLUSTER_TAB_IDS } from '@settings/search/constants';

import { type HyperConvergeConfigurationWatch } from '../../../consts/consts';
import GeneralSettingsProject from '../../../shared/GeneralSettingsProject';
import {
  getCurrentBootableVolumesNamespaceFromHCO,
  updateHCOBootableVolumesNamespace,
} from './utils/utils';

import '../../../shared/general-settings.scss';

type BootableVolumeProjectSectionProps = {
  hyperConvergeConfiguration: HyperConvergeConfigurationWatch;
  projectsData: [projects: K8sResourceCommon[], loaded: boolean, error: unknown];
};

const BootableVolumeProjectSection: FC<BootableVolumeProjectSectionProps> = ({
  hyperConvergeConfiguration,
  projectsData,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <GeneralSettingsProject
      description={t(
        "Select a project for Red Hat bootable volumes. The default project is 'openshift-virtualization-os-images'",
      )}
      hcoResourceNamespace={getCurrentBootableVolumesNamespaceFromHCO(
        hyperConvergeConfiguration?.[0],
      )}
      hyperConvergeConfiguration={hyperConvergeConfiguration}
      namespace={OPENSHIFT_OS_IMAGES_NS}
      onChange={updateHCOBootableVolumesNamespace}
      projectsData={projectsData}
      searchItemId={CLUSTER_TAB_IDS.bootableVolumesProject}
      toggleText={t('Bootable volumes project')}
    />
  );
};

export default BootableVolumeProjectSection;
