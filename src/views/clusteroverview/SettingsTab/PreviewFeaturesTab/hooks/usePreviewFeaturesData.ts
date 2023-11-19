import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import {
  INSTANCE_TYPES_USER_GUIDE_LINK,
  NIC_HOT_PLUG_LINK,
} from '@kubevirt-utils/constants/url-constants';
import {
  AUTOCOMPUTE_CPU_LIMITS_PREVIEW_ENABLED,
  BRIDGED_NIC_HOTPLUG_ENABLED,
  INSTANCE_TYPE_ENABLED,
} from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

type Feature = {
  canEdit: boolean;
  externalLink: string;
  featureEnabled: boolean;
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
  const {
    canEdit: canEditNicHotplug,
    featureEnabled: isEnabledNicHotplug,
    loading: loadingNicHotplug,
    toggleFeature: toggleNicHotplug,
  } = useFeatures(BRIDGED_NIC_HOTPLUG_ENABLED);

  const {
    canEdit: canEditInstancetypes,
    featureEnabled: isEnabledInstancetypes,
    loading: loadingInstanceTypes,
    toggleFeature: toggleInstancetypes,
  } = useFeatures(INSTANCE_TYPE_ENABLED);

  const {
    canEdit: canEditCpuLimits,
    featureEnabled: isEnabledCpuLimits,
    loading: loadingCpuLimits,
    toggleFeature: toggleCpuLimits,
  } = useFeatures(AUTOCOMPUTE_CPU_LIMITS_PREVIEW_ENABLED);

  const features = [
    {
      canEdit: canEditNicHotplug,
      externalLink: NIC_HOT_PLUG_LINK,
      featureEnabled: isEnabledNicHotplug,
      id: BRIDGED_NIC_HOTPLUG_ENABLED,
      label: t('Enable bridged network interface hot plug'),
      loading: loadingNicHotplug,
      toggleFeature: toggleNicHotplug,
    },
    {
      canEdit: canEditInstancetypes,
      externalLink: INSTANCE_TYPES_USER_GUIDE_LINK,
      featureEnabled: isEnabledInstancetypes,
      id: INSTANCE_TYPE_ENABLED,
      label: t('Enable create VirtualMachine from InstanceType'),
      loading: loadingInstanceTypes,
      toggleFeature: toggleInstancetypes,
    },
    {
      canEdit: canEditCpuLimits,
      externalLink: NIC_HOT_PLUG_LINK,
      featureEnabled: isEnabledCpuLimits,
      id: AUTOCOMPUTE_CPU_LIMITS_PREVIEW_ENABLED,
      label: t('Enable CPU limit'),
      loading: loadingCpuLimits,
      toggleFeature: toggleCpuLimits,
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
