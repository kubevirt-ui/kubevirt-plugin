import {
  getHyperConvergedGroupVersionKind,
  getHyperConvergedModel,
} from '@kubevirt-utils/resources/hyperconverged/model';
import { type K8sModel } from '@openshift-console/dynamic-plugin-sdk';

import useIsHyperConvergedV1Available from './useIsHyperConvergedV1Available';

type HyperConvergedModelResult = {
  groupVersionKind: ReturnType<typeof getHyperConvergedGroupVersionKind>;
  isHCOV1: boolean;
  loading: boolean;
  model: K8sModel;
};

type UseHyperConvergedModel = (cluster?: string) => HyperConvergedModelResult;

const useHyperConvergedModel: UseHyperConvergedModel = (cluster) => {
  const { isHCOV1, loading } = useIsHyperConvergedV1Available(cluster);

  return {
    groupVersionKind: getHyperConvergedGroupVersionKind(isHCOV1),
    isHCOV1,
    loading,
    model: getHyperConvergedModel(isHCOV1),
  };
};

export default useHyperConvergedModel;
