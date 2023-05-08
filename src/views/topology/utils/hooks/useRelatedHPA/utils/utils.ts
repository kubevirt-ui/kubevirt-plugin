import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { HorizontalPodAutoscalerKind } from '../../../types/hpaTypes';

export const doesHpaMatch =
  (workload: K8sResourceCommon) => (thisHPA: HorizontalPodAutoscalerKind) => {
    const {
      apiVersion,
      kind,
      metadata: { name },
    } = workload;
    const ref = thisHPA?.spec?.scaleTargetRef;
    return ref && ref.apiVersion === apiVersion && ref.kind === kind && ref.name === name;
  };
