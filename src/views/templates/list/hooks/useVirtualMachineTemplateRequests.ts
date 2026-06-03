import { VirtualMachineTemplateRequestModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1alpha1VirtualMachineTemplateRequest } from '@kubevirt-ui-ext/kubevirt-api/virt-template';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import useListClusters from '@kubevirt-utils/hooks/useListClusters';
import { useK8sModel } from '@openshift-console/dynamic-plugin-sdk';

import isResourceNotFoundError from './isResourceNotFoundError';

type UseVirtualMachineTemplateRequests = (
  namespace?: string,
  enabled?: boolean,
) => {
  error: any;
  loaded: boolean;
  vmTemplateRequests: V1alpha1VirtualMachineTemplateRequest[];
};

const useVirtualMachineTemplateRequests: UseVirtualMachineTemplateRequests = (
  namespace,
  enabled = true,
) => {
  const clusters = useListClusters();
  const cluster = clusters?.length === 1 ? clusters[0] : undefined;
  const [model, inFlight] = useK8sModel(VirtualMachineTemplateRequestModelGroupVersionKind);

  const modelAvailable = !!model && !inFlight;
  const shouldWatch = enabled && modelAvailable;

  const [vmTemplateRequests, loaded, loadError] = useKubevirtWatchResource<
    V1alpha1VirtualMachineTemplateRequest[]
  >(
    shouldWatch
      ? {
          cluster,
          groupVersionKind: VirtualMachineTemplateRequestModelGroupVersionKind,
          isList: true,
          namespace,
          namespaced: true,
        }
      : null,
  );

  const is404 = isResourceNotFoundError(loadError);

  return {
    error: is404 ? undefined : loadError,
    loaded: shouldWatch ? loaded || !!loadError : true,
    vmTemplateRequests: vmTemplateRequests ?? [],
  };
};

export default useVirtualMachineTemplateRequests;
