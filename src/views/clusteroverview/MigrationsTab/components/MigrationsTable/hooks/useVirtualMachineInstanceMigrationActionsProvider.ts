import { useCallback, useMemo } from 'react';

import VirtualMachineInstanceMigrationModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineInstanceMigrationModel';
import { V1VirtualMachineInstanceMigration } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VirtualMachineModelRef } from '@kubevirt-utils/models';
import { asAccessReview } from '@kubevirt-utils/resources/shared';
import { vmimStatuses } from '@kubevirt-utils/resources/vmim/statuses';
import { Action, useK8sModel } from '@openshift-console/dynamic-plugin-sdk';
import { cancelMigration } from '@virtualmachines/actions/actions';

type UseVirtualMachineInstanceMigrationActionsProvider = (
  vmim: V1VirtualMachineInstanceMigration,
) => [Action[], boolean, any];

const useVirtualMachineInstanceMigrationActionsProvider: UseVirtualMachineInstanceMigrationActionsProvider =
  (vmim) => {
    const { t } = useKubevirtTranslation();

    const [, inFlight] = useK8sModel(VirtualMachineModelRef);

    const cancelMigrationDescription = useCallback(() => {
      if ([vmimStatuses.Failed, vmimStatuses.Succeeded].includes(vmim?.status?.phase))
        return t('Cannot cancel migration for "{{ status }}" status', {
          status: vmim?.status?.phase,
        });
      return null;
    }, [t, vmim?.status?.phase]);

    const actions: Action[] = useMemo(() => {
      return [
        {
          accessReview: asAccessReview(VirtualMachineInstanceMigrationModel, vmim, 'delete'),
          cta: () => cancelMigration(vmim),
          description: cancelMigrationDescription(),
          disabled:
            !vmim || [vmimStatuses.Failed, vmimStatuses.Succeeded].includes(vmim?.status?.phase),
          id: 'vmim-action-cancel-migrate',
          label: t('Cancel migration'),
        },
      ];
    }, [vmim, t, cancelMigrationDescription]);

    return useMemo(() => [actions, !inFlight, undefined], [actions, inFlight]);
  };

export default useVirtualMachineInstanceMigrationActionsProvider;
