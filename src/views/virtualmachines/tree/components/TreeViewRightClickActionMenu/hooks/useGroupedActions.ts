import { useMemo } from 'react';

import { ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import { ACTIONS_ID } from '@virtualmachines/actions/hooks/constants';

const MANAGE_VMS_GROUP_IDS = new Set<string>([
  ACTIONS_ID.CONTROL_MENU,
  ACTIONS_ID.SNAPSHOT,
  ACTIONS_ID.MIGRATION_MENU,
  ACTIONS_ID.MOVE_TO_FOLDER,
]);

type UseGroupedActions = (baseActions: ActionDropdownItemType[]) => {
  bottomActions: ActionDropdownItemType[];
  manageVMsActions: ActionDropdownItemType[];
};

const useGroupedActions: UseGroupedActions = (baseActions) => {
  return useMemo(() => {
    const manageVMs: ActionDropdownItemType[] = [];
    const bottom: ActionDropdownItemType[] = [];

    for (const action of baseActions) {
      if (MANAGE_VMS_GROUP_IDS.has(action.id)) {
        manageVMs.push(action);
      } else {
        bottom.push(action);
      }
    }

    return { bottomActions: bottom, manageVMsActions: manageVMs };
  }, [baseActions]);
};

export default useGroupedActions;
