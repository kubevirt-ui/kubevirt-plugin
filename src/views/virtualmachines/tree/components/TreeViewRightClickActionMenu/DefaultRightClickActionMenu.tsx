import React, { FCC, useMemo } from 'react';
import { useNavigate } from 'react-router';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useVirtualMachineInstanceMigrationMapper from '@kubevirt-utils/resources/vmim/hooks/useVirtualMachineInstanceMigrationMapper';
import useVirtualMachineInstanceMigrations from '@kubevirt-utils/resources/vmim/hooks/useVirtualMachineInstanceMigrations';
import useIsACMPage from '@multicluster/useIsACMPage';
import useMultipleVirtualMachineActions from '@virtualmachines/actions/hooks/useMultipleVirtualMachineActions';
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';
import {
  FOLDER_SELECTOR_PREFIX,
  PROJECT_SELECTOR_PREFIX,
} from '@virtualmachines/tree/utils/constants';

import GroupedRightClickActionMenu from './GroupedRightClickActionMenu';
import { getCreateVMAction, getElementComponentsFromID, getVMsTrigger } from './utils';

type DefaultRightClickActionMenuProps = {
  hideMenu: () => void;
  triggerElement: HTMLElement | null;
};

const DefaultRightClickActionMenu: FCC<DefaultRightClickActionMenuProps> = ({
  hideMenu,
  triggerElement,
}) => {
  const { t } = useKubevirtTranslation();
  const isACMPage = useIsACMPage();
  const { cluster, namespace, prefix } = getElementComponentsFromID(triggerElement);

  const vms = getVMsTrigger(triggerElement);
  const [vmims] = useVirtualMachineInstanceMigrations(cluster, namespace);
  const vmimMapper = useVirtualMachineInstanceMigrationMapper(vmims);
  const baseActions = useMultipleVirtualMachineActions(vms, vmimMapper, true);
  const { setProject } = useVMWizardStore();

  const navigate = useNavigate();

  const createVMAction = useMemo(() => {
    return prefix === PROJECT_SELECTOR_PREFIX
      ? getCreateVMAction(t, navigate, namespace, setProject, isACMPage ? cluster : '')
      : undefined;
  }, [cluster, isACMPage, namespace, navigate, prefix, setProject, t]);

  const getNestedLevel = () => {
    if (prefix === FOLDER_SELECTOR_PREFIX) {
      return cluster ? 3 : 2;
    }
    return cluster ? 2 : 1;
  };

  const nestedLevel = getNestedLevel();

  return (
    <GroupedRightClickActionMenu
      actions={baseActions}
      createVMAction={createVMAction}
      hideMenu={hideMenu}
      nestedLevel={nestedLevel}
      triggerRef={() => triggerElement.children.item(0) as HTMLElement}
    />
  );
};

export default DefaultRightClickActionMenu;
