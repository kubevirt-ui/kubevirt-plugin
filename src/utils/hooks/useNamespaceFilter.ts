import { useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useNamespaces from '@kubevirt-utils/hooks/useNamespaces';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { NAMESPACE_LIST_FILTER_TYPE } from '@kubevirt-utils/utils/constants';
import { isEmpty, universalComparator } from '@kubevirt-utils/utils/utils';
import useMulticlusterNamespaces from '@multicluster/hooks/useMulticlusterNamespaces';
import useIsACMPage from '@multicluster/useIsACMPage';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';

import useListClusters from './useListClusters';

export const useNamespaceFilter = <R extends K8sResourceCommon>(): RowFilter<R> => {
  const { t } = useKubevirtTranslation();
  const allClustersSelected = useListClusters();
  const isACMPage = useIsACMPage();

  const [namespaces] = useNamespaces();
  const { allNamespaces: multiclusterNamespaces } = useMulticlusterNamespaces(allClustersSelected);

  const multiclusterNamespacesNames = useMemo(
    () =>
      multiclusterNamespaces
        ?.reduce((acc, namespace) => {
          const namespaceName = getName(namespace);
          if (!acc.includes(namespaceName)) {
            acc.push(namespaceName);
          }
          return acc;
        }, [] as string[])
        ?.sort((a, b) => universalComparator(a, b)) || [],
    [multiclusterNamespaces],
  );

  const namespaceNames = isACMPage ? multiclusterNamespacesNames : namespaces;

  return {
    filter: (input, obj) => {
      if (isEmpty(input.selected)) {
        return true;
      }

      return input.selected.some((namespaceName) => namespaceName === getNamespace(obj));
    },
    filterGroupName: t('Namespace'),
    isMatch: () => true,
    items: namespaceNames.map((namespace) => ({
      id: namespace,
      title: namespace,
    })),
    type: NAMESPACE_LIST_FILTER_TYPE,
  };
};
