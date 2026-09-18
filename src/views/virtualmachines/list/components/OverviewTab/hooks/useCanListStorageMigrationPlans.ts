import { MultiNamespaceVirtualMachineStorageMigrationPlanModel } from '@kubevirt-utils/models';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { type K8sVerb } from '@openshift-console/dynamic-plugin-sdk';
import { useFleetAccessReview } from '@stolostron/multicluster-sdk';

const useCanListStorageMigrationPlans = (): [boolean, boolean] => {
  const cluster = useClusterParam();

  const [canList, accessReviewLoading] = useFleetAccessReview({
    cluster,
    group: MultiNamespaceVirtualMachineStorageMigrationPlanModel.apiGroup,
    resource: MultiNamespaceVirtualMachineStorageMigrationPlanModel.plural,
    verb: 'list' as K8sVerb,
  });

  return [canList, accessReviewLoading];
};

export default useCanListStorageMigrationPlans;
