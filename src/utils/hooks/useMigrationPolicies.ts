import { MigrationPolicyModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1alpha1MigrationPolicy } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { Selector, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

const useMigrationPolicies = (fieldSelector?: string, selector?: Selector) =>
  useK8sWatchResource<V1alpha1MigrationPolicy[]>({
    fieldSelector,
    groupVersionKind: MigrationPolicyModelGroupVersionKind,
    isList: true,
    namespaced: false,
    selector,
  });

export default useMigrationPolicies;
