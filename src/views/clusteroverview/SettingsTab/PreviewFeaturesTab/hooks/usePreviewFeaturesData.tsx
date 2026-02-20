import React, { ReactNode } from 'react';

import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { PASST_UDN_NETWORK, TREE_VIEW_FOLDERS } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import PasstPopoverContent from '../PasstPopoverContent';

import usePasstFeatureFlag from './usePasstFeatureFlag';

type Feature = {
  canEdit: boolean;
  error?: Error;
  externalLink: string;
  featureEnabled: boolean;
  helpPopoverContent?: (hide) => ReactNode;
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
  const passtFeatureFlag = usePasstFeatureFlag();

  const features = [
    {
      externalLink: null,
      id: TREE_VIEW_FOLDERS,
      label: t('Enable folders in Virtual Machines tree view'),
      ...treeViewFoldersFeature,
    },
    {
      externalLink: null,
      helpPopoverContent: (hide) => <PasstPopoverContent hide={hide} />,
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
