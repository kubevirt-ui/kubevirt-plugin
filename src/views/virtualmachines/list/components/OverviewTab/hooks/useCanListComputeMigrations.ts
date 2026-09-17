import { VirtualMachineInstanceMigrationModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { type K8sVerb } from '@openshift-console/dynamic-plugin-sdk';
import { useFleetAccessReview } from '@stolostron/multicluster-sdk';

const useCanListComputeMigrations = (): [boolean, boolean] => {
  const namespace = useNamespaceParam();
  const cluster = useClusterParam();

  const [canList, accessReviewLoading] = useFleetAccessReview({
    cluster,
    group: VirtualMachineInstanceMigrationModel.apiGroup,
    namespace,
    resource: VirtualMachineInstanceMigrationModel.plural,
    verb: 'list' as K8sVerb,
  });

  return [canList, accessReviewLoading];
};

export default useCanListComputeMigrations;
