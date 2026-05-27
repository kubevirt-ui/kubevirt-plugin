import { useMemo } from 'react';

import { modelToGroupVersionKind, NamespaceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { isSystemNamespace } from '@kubevirt-utils/resources/namespace/helper';
import { getName } from '@kubevirt-utils/resources/shared';
import { universalComparator } from '@kubevirt-utils/utils/utils';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

type UseNamespaceResources = (
  cluster?: string,
  onlyUserNamespaces?: boolean,
) => [K8sResourceCommon[], boolean, Error];

const useNamespaceResources: UseNamespaceResources = (cluster, onlyUserNamespaces = false) => {
  const [namespaces, loaded, error] = useK8sWatchData<K8sResourceCommon[]>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(NamespaceModel),
    isList: true,
  });

  const filteredNamespaces = useMemo(() => {
    return onlyUserNamespaces
      ? namespaces?.filter((namespace) => !isSystemNamespace(getName(namespace)))
      : namespaces;
  }, [namespaces, onlyUserNamespaces]);

  const sortedNamespaces = useMemo(() => {
    return filteredNamespaces?.sort((a, b) => universalComparator(getName(a), getName(b)));
  }, [filteredNamespaces]);

  return [sortedNamespaces, loaded, error];
};

export default useNamespaceResources;
