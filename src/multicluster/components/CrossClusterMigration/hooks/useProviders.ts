import { ProviderModel, type V1beta1Provider } from '@forklift-ui/types';
import { modelToGroupVersionKind } from '@kubevirt-utils/models';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

const useProviders = (): [V1beta1Provider[], boolean, Error] => {
  return useK8sWatchData<V1beta1Provider[]>({
    groupVersionKind: modelToGroupVersionKind(ProviderModel),
    isList: true,
  });
};

export default useProviders;
