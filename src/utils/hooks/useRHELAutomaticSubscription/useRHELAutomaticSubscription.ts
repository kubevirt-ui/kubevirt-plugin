import { useState } from 'react';
import produce from 'immer';

import { ConfigMapModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  AUTOMATIC_SUBSCRIPTION_ACTIVATION_KEY,
  AUTOMATIC_SUBSCRIPTION_CUSTOM_URL,
  AUTOMATIC_SUBSCRIPTION_ORGANIZATION_ID,
  AUTOMATIC_SUBSCRIPTION_TYPE_KEY,
} from '@kubevirt-utils/hooks/useFeatures/constants';
import useFeaturesConfigMap from '@kubevirt-utils/hooks/useFeatures/useFeaturesConfigMap';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { kubevirtK8sUpdate } from '@multicluster/k8sRequests';

import {
  type RHELAutomaticSubscriptionData,
  type RHELAutomaticSubscriptionFormProps,
} from './utils/types';

type UseRHELAutomaticSubscription = (
  clusterOverride?: string,
) => RHELAutomaticSubscriptionFormProps;

const useRHELAutomaticSubscription: UseRHELAutomaticSubscription = (clusterOverride) => {
  const clusterParam = useClusterParam();
  const cluster = clusterOverride ?? clusterParam;
  const { featuresConfigMapData, isAdmin } = useFeaturesConfigMap(cluster);

  const featureConfigMap = featuresConfigMapData[0];
  const loaded = featuresConfigMapData[1];
  const loadError = featuresConfigMapData[2] as Error;

  const [loading, setLoading] = useState(false);

  const updateSubscription = async ({
    activationKey,
    customUrl,
    organizationID,
    type,
  }: Partial<RHELAutomaticSubscriptionData>): Promise<void> => {
    setLoading(true);
    const updatedConfigMap = produce(featureConfigMap, (draftCM) => {
      if (isEmpty(draftCM?.data)) draftCM.data = {};
      draftCM.data[AUTOMATIC_SUBSCRIPTION_ACTIVATION_KEY] =
        activationKey ?? draftCM.data[AUTOMATIC_SUBSCRIPTION_ACTIVATION_KEY];

      draftCM.data[AUTOMATIC_SUBSCRIPTION_ORGANIZATION_ID] =
        organizationID ?? draftCM.data[AUTOMATIC_SUBSCRIPTION_ORGANIZATION_ID];

      draftCM.data[AUTOMATIC_SUBSCRIPTION_CUSTOM_URL] =
        customUrl ?? draftCM.data[AUTOMATIC_SUBSCRIPTION_CUSTOM_URL];

      draftCM.data[AUTOMATIC_SUBSCRIPTION_TYPE_KEY] =
        type ?? draftCM.data[AUTOMATIC_SUBSCRIPTION_TYPE_KEY];
    });

    kubevirtK8sUpdate({
      cluster,
      data: updatedConfigMap,
      model: ConfigMapModel,
    })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  return {
    canEdit: isAdmin,
    loaded,
    loadError,
    loading,
    subscriptionData: {
      activationKey: featureConfigMap?.data?.[AUTOMATIC_SUBSCRIPTION_ACTIVATION_KEY],
      customUrl: featureConfigMap?.data?.[AUTOMATIC_SUBSCRIPTION_CUSTOM_URL],
      organizationID: featureConfigMap?.data?.[AUTOMATIC_SUBSCRIPTION_ORGANIZATION_ID],
      type: featureConfigMap?.data?.[AUTOMATIC_SUBSCRIPTION_TYPE_KEY],
    },
    updateSubscription,
  };
};

export default useRHELAutomaticSubscription;
