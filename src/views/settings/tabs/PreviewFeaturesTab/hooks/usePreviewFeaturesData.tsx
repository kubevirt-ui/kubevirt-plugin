import React, { type ReactNode } from 'react';

import { type IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import {
  CONTROL_DEFAULT_VIRTUALIZATION_PERMISSIONS,
  PASST_UDN_NETWORK,
  TREE_VIEW_FOLDERS,
  VM_TEMPLATES,
} from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import usePasstFeatureFlag from '@kubevirt-utils/hooks/usePasstFeatureFlag';
import useIsHyperConvergedV1Available from '@kubevirt-utils/hooks/useVMTemplateFeatureFlag/useIsHyperConvergedV1Available';
import useVMTemplateFeatureFlag from '@kubevirt-utils/hooks/useVMTemplateFeatureFlag/useVMTemplateFeatureFlag';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { PREVIEW_FEATURES_TAB_IDS } from '@settings/search/constants';

import PasstPopoverContent from '../PasstPopoverContent';

type Feature = {
  canEdit: boolean;
  error?: Error;
  externalLink: string;
  featureEnabled: boolean;
  helpPopoverContent?: ReactNode;
  id: string;
  label: string;
  loading: boolean;
  olsPromptType?: OLSPromptType;
  searchItemId: string;
  toggleFeature: (val: boolean) => Promise<IoK8sApiCoreV1ConfigMap>;
};

type UsePreviewFeaturesData = (cluster?: string) => {
  canEditAll: boolean;
  features: Feature[];
  isEnabledAll: boolean;
  loading: boolean;
  togglers: ((val: boolean) => Promise<IoK8sApiCoreV1ConfigMap>)[];
};

const usePreviewFeaturesData: UsePreviewFeaturesData = (cluster) => {
  const { t } = useKubevirtTranslation();
  const treeViewFoldersFeature = useFeatures(TREE_VIEW_FOLDERS, cluster);
  const passtFeatureFlag = usePasstFeatureFlag(cluster);
  const templateFeatureFlag = useVMTemplateFeatureFlag(cluster);
  const controlDefaultVirtualizationPermissionsFeature = useFeatures(
    CONTROL_DEFAULT_VIRTUALIZATION_PERMISSIONS,
    cluster,
  );
  // HCO v1: Template is Beta / first-class — hide jsonpatch toggle.
  // HCO v1beta1 only: keep Preview Features toggle.
  const { isHCOV1, loading: hcoV1Loading } = useIsHyperConvergedV1Available();

  const features: Feature[] = [
    {
      externalLink: null,
      id: TREE_VIEW_FOLDERS,
      label: t('Enable groups in VirtualMachines tree view'),
      searchItemId: PREVIEW_FEATURES_TAB_IDS.treeViewFolders,
      ...treeViewFoldersFeature,
    },
    {
      externalLink: null,
      helpPopoverContent: <PasstPopoverContent />,
      id: PASST_UDN_NETWORK,
      label: t('Enable Passt binding for primary user-defined networks'),
      olsPromptType: OLSPromptType.ENABLE_PASST_BINDING,
      searchItemId: PREVIEW_FEATURES_TAB_IDS.passtUDNNetwork,
      ...passtFeatureFlag,
    },
    ...(!hcoV1Loading && !isHCOV1
      ? [
          {
            externalLink: 'https://kubevirt.io/user-guide/user_workloads/vm_templates/',
            id: VM_TEMPLATES,
            label: t('Enable native VirtualMachine templates'),
            searchItemId: PREVIEW_FEATURES_TAB_IDS.vmTemplates,
            ...templateFeatureFlag,
          } satisfies Feature,
        ]
      : []),
    {
      externalLink: null,
      helpPopoverContent: t(
        'Allows admins to choose whether Virtualization permissions are granted automatically',
      ),
      id: CONTROL_DEFAULT_VIRTUALIZATION_PERMISSIONS,
      label: t('Control default Virtualization permissions'),
      searchItemId: PREVIEW_FEATURES_TAB_IDS.controlDefaultVirtualizationPermissions,
      ...controlDefaultVirtualizationPermissionsFeature,
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
      loading: hcoV1Loading,
      togglers: [],
    },
  );

  return {
    ...allFeatures,
    features,
  };
};

export default usePreviewFeaturesData;
