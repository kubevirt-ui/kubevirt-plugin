import React, { FC } from 'react';

import { OPENSHIFT_OS_IMAGES_NS } from '@kubevirt-utils/constants/constants';
import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { CLUSTER_TAB_IDS } from '@settings/search/constants';

import GeneralSettingsNamespace from '../../../shared/GeneralSettingsNamespace';

import {
  getCurrentBootableVolumesNamespaceFromHCO,
  updateHCOBootableVolumesNamespace,
} from './utils/utils';

import '../../../shared/general-settings.scss';

type BootableVolumeNamespaceSectionProps = {
  hyperConvergeConfiguration: [hyperConvergeConfig: HyperConverged, loaded: boolean, error: any];
  namespacesData: [namespaces: K8sResourceCommon[], loaded: boolean, error: any];
};

const BootableVolumeNamespaceSection: FC<BootableVolumeNamespaceSectionProps> = ({
  hyperConvergeConfiguration,
  namespacesData,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <GeneralSettingsNamespace
      description={t(
        "Select a namespace for Red Hat bootable volumes. The default namespace is 'openshift-virtualization-os-images'",
      )}
      hcoResourceNamespace={getCurrentBootableVolumesNamespaceFromHCO(
        hyperConvergeConfiguration?.[0],
      )}
      hyperConvergeConfiguration={hyperConvergeConfiguration}
      namespace={OPENSHIFT_OS_IMAGES_NS}
      onChange={updateHCOBootableVolumesNamespace}
      namespacesData={namespacesData}
      searchItemId={CLUSTER_TAB_IDS.bootableVolumesNamespace}
      toggleText={t('Bootable volumes namespace')}
    />
  );
};

export default BootableVolumeNamespaceSection;
