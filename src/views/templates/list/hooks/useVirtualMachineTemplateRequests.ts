import { VirtualMachineTemplateRequestModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1alpha1VirtualMachineTemplateRequest } from '@kubevirt-ui-ext/kubevirt-api/virt-template';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import useListClusters from '@kubevirt-utils/hooks/useListClusters';
import { getGroupVersionKindForModel } from '@openshift-console/dynamic-plugin-sdk';

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

  const [vmTemplateRequests, loaded, loadError] = useKubevirtWatchResource<
    V1alpha1VirtualMachineTemplateRequest[]
  >(
    enabled
      ? {
          cluster,
          groupVersionKind: getGroupVersionKindForModel(VirtualMachineTemplateRequestModel),
          isList: true,
          namespace,
          namespaced: true,
        }
      : null,
  );

  return {
    error: loadError,
    loaded,
    vmTemplateRequests: vmTemplateRequests ?? [],
  };
};

export default useVirtualMachineTemplateRequests;
