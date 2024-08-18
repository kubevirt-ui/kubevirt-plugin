import { useState } from 'react';
import produce from 'immer';

import { ConfigMapModel } from '@kubevirt-ui/kubevirt-api/console';
import {
  AUTOMATIC_SUBSCRIPTION_ACTIVATION_KEY,
  AUTOMATIC_SUBSCRIPTION_CUSTOM_URL,
  AUTOMATIC_SUBSCRIPTION_ORGANIZATION_ID,
  AUTOMATIC_SUBSCRIPTION_TYPE_KEY,
} from '@kubevirt-utils/hooks/useFeatures/constants';
import useFeaturesConfigMap from '@kubevirt-utils/hooks/useFeatures/useFeaturesConfigMap';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';

import { RHELAutomaticSubscriptionFormProps } from './utils/types';

type UseRHELAutomaticSubscription = () => RHELAutomaticSubscriptionFormProps;

const useRHELAutomaticSubscription: UseRHELAutomaticSubscription = () => {
  const {
    featuresConfigMapData: [featureConfigMap, loaded, loadError],
    isAdmin,
  } = useFeaturesConfigMap();

  const [loading, setLoading] = useState(false);

  const updateSubscription = async ({ activationKey, customUrl, organizationID, type }) => {
    setLoading(true);
    const updatedConfigMap = produce(featureConfigMap, (draftCM) => {
      if (isEmpty(draftCM?.data)) draftCM.data = {};
      draftCM.data[AUTOMATIC_SUBSCRIPTION_ACTIVATION_KEY] =
        activationKey !== undefined
          ? activationKey
          : draftCM.data[AUTOMATIC_SUBSCRIPTION_ACTIVATION_KEY];

      draftCM.data[AUTOMATIC_SUBSCRIPTION_ORGANIZATION_ID] =
        organizationID !== undefined
          ? organizationID
          : draftCM.data[AUTOMATIC_SUBSCRIPTION_ORGANIZATION_ID];

      draftCM.data[AUTOMATIC_SUBSCRIPTION_CUSTOM_URL] =
        customUrl !== undefined ? customUrl : draftCM.data[AUTOMATIC_SUBSCRIPTION_CUSTOM_URL];

      draftCM.data[AUTOMATIC_SUBSCRIPTION_TYPE_KEY] =
        type !== undefined ? type : draftCM.data[AUTOMATIC_SUBSCRIPTION_TYPE_KEY];
    });

    k8sUpdate({
      data: updatedConfigMap,
      model: ConfigMapModel,
    }).finally(() => setLoading(false));
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
