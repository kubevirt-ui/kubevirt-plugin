import { useMemo } from 'react';

import { modelToGroupVersionKind, NamespaceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { isSystemNamespace } from '@kubevirt-utils/resources/namespace/helper';
import { getName } from '@kubevirt-utils/resources/shared';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

type UseNamespaces = (cluster?: string, onlyUserNamespaces?: boolean) => [string[], boolean, any];

const useNamespaces: UseNamespaces = (cluster, onlyUserNamespaces = false) => {
  const [namespacesData, loaded, error] = useK8sWatchData<K8sResourceCommon[]>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(NamespaceModel),
    isList: true,
  });

  const namespacesNames = useMemo(() => namespacesData?.map(getName), [namespacesData]);

  const filteredNamespacesData = useMemo(() => {
    return onlyUserNamespaces
      ? namespacesNames?.filter((namespace) => !isSystemNamespace(namespace))
      : namespacesNames;
  }, [namespacesNames, onlyUserNamespaces]);

  const sortedNamespacesNames = useMemo(() => {
    return filteredNamespacesData?.sort((a, b) => a.localeCompare(b));
  }, [filteredNamespacesData]);

  return [sortedNamespacesNames, loaded, error];
};

export default useNamespaces;
