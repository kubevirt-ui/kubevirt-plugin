import * as React from 'react';

import { V1VirtualMachineInstanceMigration } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VirtualMachineModelRef } from '@kubevirt-utils/models';
import { Action, useK8sModel } from '@openshift-console/dynamic-plugin-sdk';
import { cancelMigration } from '@virtualmachines/actions/actions';

import { vmimStatuses } from '../utils/statuses';

type UseVirtualMachineInstanceMigrationActionsProvider = (
  vmim: V1VirtualMachineInstanceMigration,
) => [Action[], boolean, any];

const useVirtualMachineInstanceMigrationActionsProvider: UseVirtualMachineInstanceMigrationActionsProvider =
  (vmim) => {
    const { t } = useKubevirtTranslation();

    const [, inFlight] = useK8sModel(VirtualMachineModelRef);

    const cancelMigrationDescription = React.useCallback(() => {
      if ([vmimStatuses.Failed, vmimStatuses.Succeeded].includes(vmim?.status?.phase))
        return t(`Cannot cancel migration for '${vmim?.status?.phase}' status`);
      return null;
    }, [t, vmim?.status?.phase]);

    const actions: Action[] = React.useMemo(() => {
      return [
        {
          id: 'vmim-action-cancel-migrate',
          disabled:
            !vmim || [vmimStatuses.Failed, vmimStatuses.Succeeded].includes(vmim?.status?.phase),
          label: t('Cancel migration'),
          cta: () => cancelMigration(vmim),
          description: cancelMigrationDescription(),
        },
      ];
    }, [vmim, t, cancelMigrationDescription]);

    return React.useMemo(() => [actions, !inFlight, undefined], [actions, inFlight]);
  };

export default useVirtualMachineInstanceMigrationActionsProvider;
