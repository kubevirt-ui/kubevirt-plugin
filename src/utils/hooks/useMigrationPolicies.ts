import { MigrationPolicyModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1alpha1MigrationPolicy } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Selector } from '@openshift-console/dynamic-plugin-sdk';

import useKubevirtWatchResource from './useKubevirtWatchResource/useKubevirtWatchResource';
import useListClusters from './useListClusters';

const useMigrationPolicies = (fieldSelector?: string, selector?: Selector) => {
  const clusters = useListClusters();

  const multiclusterFilters = [
    ...(isEmpty(clusters) ? [] : [{ property: 'cluster', values: clusters }]),
  ];

  return useKubevirtWatchResource<V1alpha1MigrationPolicy[]>(
    {
      fieldSelector,
      groupVersionKind: MigrationPolicyModelGroupVersionKind,
      isList: true,
      namespaced: false,
      selector,
    },
    null,
    multiclusterFilters,
  );
};

export default useMigrationPolicies;
