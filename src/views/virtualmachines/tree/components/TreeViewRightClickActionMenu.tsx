import React, { FC } from 'react';

import ActionDropdownItem from '@kubevirt-utils/components/ActionDropdownItem/ActionDropdownItem';
import useSingleNodeCluster from '@kubevirt-utils/hooks/useSingleNodeCluster';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { Menu, MenuContent, MenuList, Popper, TreeViewDataItem } from '@patternfly/react-core';
import useVirtualMachineActionsProvider from '@virtualmachines/actions/hooks/useVirtualMachineActionsProvider';
import { getVMIMFromMapper } from '@virtualmachines/utils/mappers';

import useTreeViewItemRightClick from '../hooks/useTreeViewItemRightClick';
import { vmimMapperSignal, vmsSignal } from '../utils/signals';

type TreeViewRightClickActionMenuProps = {
  treeData: TreeViewDataItem[];
};

const TreeViewRightClickActionMenu: FC<TreeViewRightClickActionMenuProps> = ({ treeData }) => {
  const {
    hideMenu,
    triggeredVMName: vmName,
    triggeredVMNamespace: vmNamespace,
    triggerElement: treeViewItemTrigger,
  } = useTreeViewItemRightClick(treeData);

  const [isSingleNodeCluster] = useSingleNodeCluster();

  const vmim = getVMIMFromMapper(vmimMapperSignal.value, vmName, vmNamespace);
  const vm = vmsSignal?.value?.find(
    (resource) => getName(resource) === vmName && getNamespace(resource) === vmNamespace,
  );

  const [actions] = useVirtualMachineActionsProvider(vm, vmim, isSingleNodeCluster);

  if (!treeViewItemTrigger) return null;

  return (
    <>
      <Popper
        popper={
          <Menu className="right-click-action-menu" containsFlyout>
            <MenuContent>
              <MenuList>
                {actions?.map((action) => (
                  <ActionDropdownItem action={action} key={action?.id} setIsOpen={hideMenu} />
                ))}
              </MenuList>
            </MenuContent>
          </Menu>
        }
        appendTo={treeViewItemTrigger}
        isVisible
        position="end"
      />
      <div className="right-click-action-menu-background" onClick={hideMenu}></div>
    </>
  );
};

export default TreeViewRightClickActionMenu;
