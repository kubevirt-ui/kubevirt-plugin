import { K8sResourceConditionStatus } from '@kubevirt-utils/components/ConditionsTable/ConditionsTable';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export type K8sResourceCondition = {
  type: string;
  status: keyof typeof K8sResourceConditionStatus;
  lastTransitionTime?: string;
  reason?: string;
  message?: string;
};

export type PersistentVolumeClaimKind = K8sResourceCommon & {
  spec: {
    accessModes: string[];
    resources: {
      requests: {
        storage: string;
      };
    };
    storageClassName: string;
    volumeMode?: string;
    /* Parameters in a cloned PVC */
    dataSource?: {
      name: string;
      kind: string;
      apiGroup: string;
    };
    /**/
  };
  status?: {
    phase: string;
  };
};
