import { useMemo } from 'react';

import { VirtualMachineInstanceMigrationModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { ALL_CLUSTERS_KEY, ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import useActiveNamespace from '@kubevirt-utils/hooks/useActiveNamespace';
import useActiveClusterParam from '@multicluster/hooks/useActiveClusterParam';
import { K8sVerb } from '@openshift-console/dynamic-plugin-sdk';
import { useFleetAccessReview } from '@stolostron/multicluster-sdk';

const useCanListComputeMigrations = (): [boolean, boolean] => {
  const activeNamespace = useActiveNamespace();
  const cluster = useActiveClusterParam();

  const namespace = useMemo(
    () => (activeNamespace !== ALL_NAMESPACES_SESSION_KEY ? activeNamespace : undefined),
    [activeNamespace],
  );

  const normalizedCluster = cluster === ALL_CLUSTERS_KEY ? undefined : cluster;

  const [canList, accessReviewLoading] = useFleetAccessReview({
    cluster: normalizedCluster,
    group: VirtualMachineInstanceMigrationModel.apiGroup,
    namespace,
    resource: VirtualMachineInstanceMigrationModel.plural,
    verb: 'list' as K8sVerb,
  });

  return [canList, accessReviewLoading];
};

export default useCanListComputeMigrations;
