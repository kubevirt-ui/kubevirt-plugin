import { useMemo } from 'react';

import { VirtualMachineInstancetypeModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1VirtualMachineInstancetype } from '@kubevirt-ui/kubevirt-api/kubevirt';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import useListClusters from '@kubevirt-utils/hooks/useListClusters';
import useListNamespaces from '@kubevirt-utils/hooks/useListNamespaces';
import { isAllNamespaces, isEmpty } from '@kubevirt-utils/utils/utils';
import { Selector } from '@openshift-console/dynamic-plugin-sdk';

type UseVirtualMachineInstanceTypes = (params?: {
  fieldSelector?: string;
  namespace?: string;
  selector?: Selector;
}) => [instanceTypes: V1beta1VirtualMachineInstancetype[], loaded: boolean, loadError: Error];

const useVirtualMachineInstanceTypes: UseVirtualMachineInstanceTypes = ({
  fieldSelector,
  namespace,
  selector,
}) => {
  const clusters = useListClusters();
  const namespaces = useListNamespaces();
  const isAllNamespace = isAllNamespaces(namespace);

  const multiclusterFilters = useMemo(
    () => [
      ...(isEmpty(clusters) ? [] : [{ property: 'cluster', values: clusters }]),
      ...(isEmpty(namespaces) ? [] : [{ property: 'namespace', values: namespaces }]),
    ],
    [clusters, namespaces],
  );

  const [instanceTypes, loaded, loadError] = useKubevirtWatchResource<
    V1beta1VirtualMachineInstancetype[]
  >(
    {
      fieldSelector,
      groupVersionKind: VirtualMachineInstancetypeModelGroupVersionKind,
      isList: true,
      selector,
      ...(!isAllNamespace && { namespace }),
    },
    null,
    multiclusterFilters,
  );

  return [instanceTypes || [], loaded || !!loadError, loadError];
};

export default useVirtualMachineInstanceTypes;
