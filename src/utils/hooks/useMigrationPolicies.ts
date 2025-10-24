import { MigrationPolicyModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1alpha1MigrationPolicy } from '@kubevirt-ui/kubevirt-api/kubevirt';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { Selector } from '@openshift-console/dynamic-plugin-sdk';

import useKubevirtWatchResource from './useKubevirtWatchResource/useKubevirtWatchResource';

const useMigrationPolicies = (fieldSelector?: string, selector?: Selector) => {
  const cluster = useClusterParam();

  return useKubevirtWatchResource<V1alpha1MigrationPolicy[]>({
    cluster,
    fieldSelector,
    groupVersionKind: MigrationPolicyModelGroupVersionKind,
    isList: true,
    namespaced: false,
    selector,
  });
};

export default useMigrationPolicies;
