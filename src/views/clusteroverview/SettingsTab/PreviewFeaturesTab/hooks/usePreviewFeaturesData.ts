import { FC } from 'react';

import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { PASST_UDN_NETWORK, TREE_VIEW_FOLDERS } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FEATURE_KUBEVIRT_CROSS_CLUSTER_MIGRATION } from '@multicluster/constants';
import { useIsFleetAvailable } from '@stolostron/multicluster-sdk';

import PasstPopoverContent from '../PasstPopoverContent';

import usePasstFeatureFlag from './usePasstFeatureFlag';

type Feature = {
  canEdit: boolean;
  error?: Error;
  externalLink: string;
  featureEnabled: boolean;
  helpPopoverContent?: FC;
  id: string;
  label: string;
  loading: boolean;
  toggleFeature: (val: boolean) => Promise<IoK8sApiCoreV1ConfigMap>;
};

type UsePreviewFeaturesData = () => {
  canEditAll: boolean;
  features: Feature[];
  isEnabledAll: boolean;
  loading: boolean;
  togglers: ((val: boolean) => Promise<IoK8sApiCoreV1ConfigMap>)[];
};

const usePreviewFeaturesData: UsePreviewFeaturesData = () => {
  const { t } = useKubevirtTranslation();
  const treeViewFoldersFeature = useFeatures(TREE_VIEW_FOLDERS);
  const kubevirtCrossClusterMigration = useFeatures(FEATURE_KUBEVIRT_CROSS_CLUSTER_MIGRATION);
  const passtFeatureFlag = usePasstFeatureFlag();

  const isFleetAvailable = useIsFleetAvailable();

  const features = [
    {
      externalLink: null,
      id: TREE_VIEW_FOLDERS,
      label: t('Enable folders in Virtual Machines tree view'),
      ...treeViewFoldersFeature,
    },
    {
      externalLink: null,
      id: FEATURE_KUBEVIRT_CROSS_CLUSTER_MIGRATION,
      label: t('Enable Kubevirt cross cluster migration'),
      ...kubevirtCrossClusterMigration,
      canEdit: isFleetAvailable && kubevirtCrossClusterMigration?.canEdit,
    },
    {
      externalLink: null,
      helpPopoverContent: PasstPopoverContent,
      id: PASST_UDN_NETWORK,
      label: t('Enable Passt binding for primary user-defined networks'),
      ...passtFeatureFlag,
    },
  ];

  const allFeatures = features.reduce(
    (acc, feature) => {
      acc.canEditAll = acc?.canEditAll && feature?.canEdit;
      acc.isEnabledAll = acc?.isEnabledAll && feature?.featureEnabled;
      acc.loading = acc?.loading || feature?.loading;
      acc.togglers.push(feature.toggleFeature);
      return acc;
    },
    {
      canEditAll: true,
      isEnabledAll: true,
      loading: false,
      togglers: [],
    },
  );

  return {
    ...allFeatures,
    features,
  };
};

export default usePreviewFeaturesData;
