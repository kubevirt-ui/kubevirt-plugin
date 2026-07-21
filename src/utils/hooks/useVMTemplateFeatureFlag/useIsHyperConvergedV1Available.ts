import {
  isK8sForbiddenError,
  isK8sNotFoundError,
} from '@kubevirt-utils/resources/errorStatusChecks';
import { operatorNamespaceSignal } from '@kubevirt-utils/store/operatorNamespace';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { HyperConvergedV1GroupVersionKind } from './constants';

type UseIsHyperConvergedV1Available = (clusterOverride?: string) => {
  isHCOV1: boolean;
  loading: boolean;
};

/**
 * HCO v1 exposes slice-based featureGates (Template is Beta / first-class).
 * HCO v1beta1 still needs the Preview Features jsonpatch toggle.
 * Probes the target cluster (ACM-aware) via a shared watch; does not use useK8sModel.
 * @param clusterOverride
 */
const useIsHyperConvergedV1Available: UseIsHyperConvergedV1Available = (clusterOverride) => {
  const clusterParam = useClusterParam();
  const cluster = clusterOverride ?? clusterParam;
  const operatorNamespace = operatorNamespaceSignal.value;

  const [, loaded, loadError] = useK8sWatchData<K8sResourceCommon[]>(
    operatorNamespace
      ? {
          cluster,
          groupVersionKind: HyperConvergedV1GroupVersionKind,
          isList: true,
          namespace: operatorNamespace,
        }
      : null,
  );

  if (isEmpty(operatorNamespace) || !loaded) {
    return { isHCOV1: false, loading: true };
  }

  // 404 means HCO v1 is not served on the target cluster.
  if (isK8sNotFoundError(loadError)) {
    return { isHCOV1: false, loading: false };
  }

  // Successful watch, or 403 (API exists but LIST/WATCH is denied).
  if (!loadError || isK8sForbiddenError(loadError)) {
    return { isHCOV1: true, loading: false };
  }

  // Timeouts, transport failures, and 5xx are indeterminate — keep the toggle.
  return { isHCOV1: false, loading: false };
};

export default useIsHyperConvergedV1Available;
