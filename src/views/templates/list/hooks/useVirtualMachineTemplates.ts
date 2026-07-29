import { VirtualMachineTemplateModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1beta1VirtualMachineTemplate } from '@kubevirt-ui-ext/kubevirt-api/virt-template';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import useListClusters from '@kubevirt-utils/hooks/useListClusters';
import isResourceNotFoundError from '@kubevirt-utils/utils/isResourceNotFoundError';
import { useK8sModel } from '@openshift-console/dynamic-plugin-sdk';

type UseVirtualMachineTemplates = (
  namespace?: string,
  enabled?: boolean,
) => {
  error: any;
  loaded: boolean;
  vmTemplates: V1beta1VirtualMachineTemplate[];
};

const useVirtualMachineTemplates: UseVirtualMachineTemplates = (namespace, enabled = true) => {
  const clusters = useListClusters();
  const cluster = clusters?.length === 1 ? clusters[0] : undefined;
  const isAdmin = useIsAdmin();
  const [model, inFlight] = useK8sModel(VirtualMachineTemplateModelGroupVersionKind);

  const modelAvailable = !!model && !inFlight;
  const shouldWatch = enabled && modelAvailable && (isAdmin || Boolean(namespace));

  const [vmTemplates, loaded, loadError] = useKubevirtWatchResource<
    V1beta1VirtualMachineTemplate[]
  >(
    shouldWatch
      ? {
          cluster,
          groupVersionKind: VirtualMachineTemplateModelGroupVersionKind,
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
    vmTemplates: vmTemplates ?? [],
  };
};

export default useVirtualMachineTemplates;
