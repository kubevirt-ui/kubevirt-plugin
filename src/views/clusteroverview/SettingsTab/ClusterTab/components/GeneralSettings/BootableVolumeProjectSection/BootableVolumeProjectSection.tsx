import React, { FC } from 'react';

import { OPENSHIFT_OS_IMAGES_NS } from '@kubevirt-utils/constants/constants';
import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import GeneralSettingsProject from '../shared/GeneralSettingsProject';

import {
  getCurrentBootableVolumesNamespaceFromHCO,
  updateHCOBootableVolumesNamespace,
} from './utils/utils';

import '../shared/general-settings.scss';

type BootableVolumeProjectSectionProps = {
  hyperConvergeConfiguration: [hyperConvergeConfig: HyperConverged, loaded: boolean, error: any];
  projectsData: [projects: K8sResourceCommon[], loaded: boolean, error: any];
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
      toggleText={t('Bootable volumes project')}
    />
  );
};

export default BootableVolumeProjectSection;
