import { MigrationPolicyModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1alpha1MigrationPolicy } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

const useMigrationPolicies = () =>
  useK8sWatchResource<V1alpha1MigrationPolicy[]>({
    groupVersionKind: MigrationPolicyModelGroupVersionKind,
    isList: true,
    namespaced: false,
  });

export default useMigrationPolicies;
