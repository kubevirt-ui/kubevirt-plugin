import produce from 'immer';

import { KubeDeschedulerModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  KUBE_DESCHEDULER_NAME,
  KUBE_DESCHEDULER_NAMESPACE,
} from '@kubevirt-utils/resources/descheduler/constants';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { kubevirtK8sUpdate } from '@multicluster/k8sRequests';

import {
  ActualUtilizationProfile,
  DeschedulerMode,
  DeschedulerProfile,
  DeviationThreshold,
  KubeDescheduler,
} from './types';

export const defaultDescheduler: KubeDescheduler = {
  apiVersion: 'operator.openshift.io/v1',
  kind: 'KubeDescheduler',
  metadata: {
    name: KUBE_DESCHEDULER_NAME,
    namespace: KUBE_DESCHEDULER_NAMESPACE,
  },
  spec: {
    deschedulingIntervalSeconds: 30,
    managementState: 'Managed',
    mode: DeschedulerMode.Automatic,
    profileCustomizations: {
      devActualUtilizationProfile: ActualUtilizationProfile.PrometheusCPUCombined,
      devDeviationThresholds: DeviationThreshold.AsymmetricLow,
      devEnableSoftTainter: true,
    },
    profiles: [DeschedulerProfile.KubeVirtRelieveAndMigrate],
  },
};

export const updateDeviationThreshold = (
  descheduler: KubeDescheduler,
  newThreshold: DeviationThreshold,
  cluster?: string,
) => {
  const updatedDescheduler = produce(descheduler, (tempDescheduler) => {
    tempDescheduler.spec.profileCustomizations = {
      ...tempDescheduler.spec.profileCustomizations,
      devDeviationThresholds: newThreshold,
    };
    return tempDescheduler;
  });

  return kubevirtK8sUpdate({
    cluster,
    data: updatedDescheduler,
    model: { ...KubeDeschedulerModel, namespaced: true },
    name: getName(updatedDescheduler),
    ns: getNamespace(updatedDescheduler),
  });
};
