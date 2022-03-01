import {
  V1alpha1VirtualMachineRestore,
  V1alpha1VirtualMachineSnapshot,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  getConditionReason,
  getStatusConditionsByType,
  isConditionStatusTrue,
} from '@kubevirt-utils/selectors';

export const useSnapshotStatus = (
  snapshot: V1alpha1VirtualMachineSnapshot,
  restore: V1alpha1VirtualMachineRestore,
) => {
  const { t } = useKubevirtTranslation();
  const snapshotError = snapshot?.status?.error;
  const restoreError = getConditionReason(getStatusConditionsByType(restore, 'Progressing'));
  const isRestoreProgressing = isConditionStatusTrue(
    getStatusConditionsByType(restore, 'Progressing'),
  );
  const isSnapshotReady = snapshot?.status?.readyToUse;

  if (snapshotError) {
    return t('Create error');
  }

  if (restoreError) {
    return t('Restore error');
  }

  if (isRestoreProgressing) {
    return t('Restoring');
  }

  return isSnapshotReady ? t('Ready') : t('Creating');
};
