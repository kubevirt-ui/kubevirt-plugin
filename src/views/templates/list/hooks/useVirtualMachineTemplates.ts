import { VirtualMachineTemplateModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1alpha1VirtualMachineTemplate } from '@kubevirt-ui-ext/kubevirt-api/virt-template';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import useListClusters from '@kubevirt-utils/hooks/useListClusters';
import { getGroupVersionKindForModel } from '@openshift-console/dynamic-plugin-sdk';

type UseVirtualMachineTemplates = (
  namespace?: string,
  enabled?: boolean,
) => {
  error: any;
  loaded: boolean;
  vmTemplates: V1alpha1VirtualMachineTemplate[];
};

const useVirtualMachineTemplates: UseVirtualMachineTemplates = (namespace, enabled = true) => {
  const clusters = useListClusters();
  const cluster = clusters?.length === 1 ? clusters[0] : undefined;

  const [vmTemplates, loaded, loadError] = useKubevirtWatchResource<
    V1alpha1VirtualMachineTemplate[]
  >(
    enabled
      ? {
          cluster,
          groupVersionKind: getGroupVersionKindForModel(VirtualMachineTemplateModel),
          isList: true,
          namespace,
          namespaced: true,
        }
      : null,
  );

  return {
    error: loadError,
    loaded,
    vmTemplates: vmTemplates ?? [],
  };
};

export default useVirtualMachineTemplates;
