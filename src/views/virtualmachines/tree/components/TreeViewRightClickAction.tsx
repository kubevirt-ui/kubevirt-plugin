import React, { FC } from 'react';

import ActionDropdownItem from '@kubevirt-utils/components/ActionDropdownItem/ActionDropdownItem';
import useSingleNodeCluster from '@kubevirt-utils/hooks/useSingleNodeCluster';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { Menu, MenuContent, MenuList, Popper, TreeViewDataItem } from '@patternfly/react-core';
import useVirtualMachineActionsProvider from '@virtualmachines/actions/hooks/useVirtualMachineActionsProvider';
import { getVMIMFromMapper } from '@virtualmachines/utils/mappers';

import useContextMenuListener from '../hooks/useContextMenuListener';
import { vmimMapperSignal, vmsSignal } from '../utils/signals';

import { popupbackgroundStyle, treeViewActionMenuStyle } from './constants';

type TreeViewRightClickActionProps = {
  treeData: TreeViewDataItem[];
};

const TreeViewRightClickAction: FC<TreeViewRightClickActionProps> = ({ treeData }) => {
  const [contextMenuTrigger, hide] = useContextMenuListener(treeData);
  const [isSingleNodeCluster] = useSingleNodeCluster();

  const [namespace, name] = contextMenuTrigger?.id?.split('/') || ['', ''];

  const vmim = getVMIMFromMapper(vmimMapperSignal.value, name, namespace);
  const vm = vmsSignal?.value?.find(
    (resource) => getName(resource) === name && getNamespace(resource) === namespace,
  );

  const [actions] = useVirtualMachineActionsProvider(vm, vmim, isSingleNodeCluster);

  if (!contextMenuTrigger) return null;

  return (
    <>
      <Popper
        popper={
          <Menu containsFlyout style={treeViewActionMenuStyle}>
            <MenuContent>
              <MenuList>
                {actions?.map((action) => (
                  <ActionDropdownItem action={action} key={action?.id} setIsOpen={hide} />
                ))}
              </MenuList>
            </MenuContent>
          </Menu>
        }
        appendTo={contextMenuTrigger}
        isVisible
        position="end"
      />
      <div onClick={hide} style={popupbackgroundStyle}></div>
    </>
  );
};

export default TreeViewRightClickAction;
