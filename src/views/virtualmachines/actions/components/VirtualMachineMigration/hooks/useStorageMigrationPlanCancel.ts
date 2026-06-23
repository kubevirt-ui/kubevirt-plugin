import { useCallback, useState } from 'react';

import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sDelete } from '@multicluster/k8sRequests';
import type { K8sModel, K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

type UseStorageMigrationPlanCancelArgs = {
  cluster?: string;
  onClose: () => void;
  planModel: K8sModel;
  storageMigrationPlan: K8sResourceCommon;
};

/**
 * Deletes the plan resource from props; on success calls onClose. Sets cancelError when deletion fails.
 */
const useStorageMigrationPlanCancel = ({
  cluster,
  onClose,
  planModel,
  storageMigrationPlan,
}: UseStorageMigrationPlanCancelArgs) => {
  const [cancelError, setCancelError] = useState<Error | null>(null);

  const onCancelMigration = useCallback(async () => {
    try {
      await kubevirtK8sDelete({
        cluster: getCluster(storageMigrationPlan) ?? cluster,
        model: planModel,
        resource: storageMigrationPlan,
      });
    } catch (error) {
      setCancelError(error instanceof Error ? error : new Error(String(error)));
      return;
    }
    onClose();
  }, [cluster, onClose, planModel, storageMigrationPlan]);

  return { cancelError, onCancelMigration };
};

export default useStorageMigrationPlanCancel;
