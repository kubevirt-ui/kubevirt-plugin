import { useMemo } from 'react';

import { modelToGroupVersionKind, NamespaceModel, ProjectModel } from '@kubevirt-utils/models';
import { K8sResourceCommon, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { getUserDefaultNamespaceName } from '../helpers';

import useHasProjects from './useHasProjects';

const useUserDefaultNamespace = (): [defaultNamespace: string, loaded: boolean] => {
  const hasProjects = useHasProjects();
  const [namespaces, namespacesLoaded] = useK8sWatchResource<K8sResourceCommon[]>({
    groupVersionKind: modelToGroupVersionKind(hasProjects ? ProjectModel : NamespaceModel),
    isList: true,
    namespaced: false,
  });

  const userDefaultNamespace = useMemo(() => getUserDefaultNamespaceName(namespaces), [namespaces]);
  return [userDefaultNamespace, namespacesLoaded];
};

export default useUserDefaultNamespace;
