import { useState } from 'react';
import produce from 'immer';

import { ConfigMapModel } from '@kubevirt-ui/kubevirt-api/console';
import {
  AUTOMATIC_SUBSCRIPTION_ACTIVATION_KEY,
  AUTOMATIC_SUBSCRIPTION_ORGANIZATION_ID,
} from '@kubevirt-utils/hooks/useFeatures/constants';
import useFeaturesConfigMap from '@kubevirt-utils/hooks/useFeatures/useFeaturesConfigMap';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';

import { RHELAutomaticSubscriptionData } from './utils/types';

type UseRHELAutomaticSubscription = () => {
  canEdit: boolean;
  loaded: boolean;
  loadError: Error;
  loading: boolean;
  subscriptionData: RHELAutomaticSubscriptionData;
  updateSubscription: (activationKey: string, organizationID: string) => void;
};

const useRHELAutomaticSubscription: UseRHELAutomaticSubscription = () => {
  const {
    featuresConfigMapData: [featureConfigMap, loaded, loadError],
    isAdmin,
  } = useFeaturesConfigMap();

  const [loading, setLoading] = useState(false);

  const updateSubscription = async (activationKey: string, organizationID: string) => {
    setLoading(true);
    const updatedConfigMap = produce(featureConfigMap, (draftCM) => {
      if (isEmpty(draftCM?.data)) draftCM.data = {};
      draftCM.data[AUTOMATIC_SUBSCRIPTION_ACTIVATION_KEY] = activationKey;
      draftCM.data[AUTOMATIC_SUBSCRIPTION_ORGANIZATION_ID] = organizationID;
    });

    k8sUpdate({
      data: updatedConfigMap,
      model: ConfigMapModel,
    }).then(() => setLoading(false));
  };

  return {
    canEdit: isAdmin,
    loaded,
    loadError,
    loading,
    subscriptionData: {
      activationKey: featureConfigMap?.data?.[AUTOMATIC_SUBSCRIPTION_ACTIVATION_KEY],
      organizationID: featureConfigMap?.data?.[AUTOMATIC_SUBSCRIPTION_ORGANIZATION_ID],
    },
    updateSubscription,
  };
};

export default useRHELAutomaticSubscription;
