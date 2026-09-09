import { MigrationPolicyModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1alpha1MigrationPolicy } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { type Selector } from '@openshift-console/dynamic-plugin-sdk';

import useKubevirtWatchResource, {
  type Result,
} from './useKubevirtWatchResource/useKubevirtWatchResource';
import useListClusters from './useListClusters';

type UseMigrationPolicies = (
  fieldSelector?: string,
  selector?: Selector,
) => Result<V1alpha1MigrationPolicy[]>;

const useMigrationPolicies: UseMigrationPolicies = (fieldSelector, selector) => {
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
