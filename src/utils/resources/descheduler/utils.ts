import produce from 'immer';

import KubeDeschedulerModel from '@kubevirt-ui/kubevirt-api/console/models/KubeDeschedulerModel';
import { KUBE_DESCHEDULER_NAMESPACE } from '@kubevirt-utils/resources/descheduler/constants';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';

import {
  ActualUtilizationProfile,
  DeschedulerMode,
  DeviationThreshold,
  KubeDescheduler,
} from './types';

export const defaultDescheduler: KubeDescheduler = {
  apiVersion: 'operator.openshift.io/v1',
  kind: 'KubeDescheduler',
  metadata: {
    name: 'cluster',
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
    profiles: ['DevKubeVirtRelieveAndMigrate'],
  },
};

export const updateDeviationThreshold = (
  descheduler: KubeDescheduler,
  newThreshold: DeviationThreshold,
) => {
  const updatedDescheduler = produce(descheduler, (tempDescheduler) => {
    tempDescheduler.spec.profileCustomizations = { devDeviationThresholds: newThreshold };
    return tempDescheduler;
  });

  return k8sUpdate({
    data: updatedDescheduler,
    model: KubeDeschedulerModel,
    name: getName(updatedDescheduler),
    ns: getNamespace(updatedDescheduler),
  });
};
