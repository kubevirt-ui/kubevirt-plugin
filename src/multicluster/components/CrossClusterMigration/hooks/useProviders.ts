import { ProviderModel, V1beta1Provider } from '@kubev2v/types';
import { modelToGroupVersionKind } from '@kubevirt-utils/models';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

const useProviders = () => {
  return useK8sWatchData<V1beta1Provider[]>({
    groupVersionKind: modelToGroupVersionKind(ProviderModel),
    isList: true,
  });
};

export default useProviders;
