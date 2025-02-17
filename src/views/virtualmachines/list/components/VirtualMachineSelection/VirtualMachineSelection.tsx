import React, { FC, useRef, useState } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useClickOutside } from '@kubevirt-utils/hooks/useClickOutside/useClickOutside';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { PaginationState } from '@kubevirt-utils/hooks/usePagination/utils/types';
import {
  Checkbox,
  Menu,
  MenuContent,
  MenuItem,
  MenuList,
  MenuToggle,
  Popper,
} from '@patternfly/react-core';

import { deselectAll, selectAll, selectedVMs } from '../../selectedVMs';

import './virtual-machine-selection.scss';

type VirtualMachineSelectionProps = {
  loaded?: boolean;
  pagination: PaginationState;
  vms: V1VirtualMachine[];
};

const VirtualMachineSelection: FC<VirtualMachineSelectionProps> = ({ loaded, pagination, vms }) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside([menuRef, toggleRef], () => setIsOpen(false));

  const onToggle = () => {
    setIsOpen((prevIsOpen) => !prevIsOpen);
  };

  const onSelectItem = (vmsToSelect?: V1VirtualMachine[]) => {
    vmsToSelect ? selectAll(vmsToSelect) : deselectAll();

    setIsOpen(false);
  };

  const vmsInPage = vms?.slice(pagination.startIndex, pagination.endIndex);

  const pageVMCount = vmsInPage.length;

  if (!loaded) return null;

  const partiallyChecked = selectedVMs.value.length > 0 && selectedVMs.value.length !== vms.length;
  const isChecked = selectedVMs.value.length === vms.length;

  return (
    <div className="virtual-machine-selection" ref={containerRef}>
      <MenuToggle isExpanded={isOpen} onClick={onToggle} ref={toggleRef}>
        <Checkbox
          label={
            selectedVMs.value.length !== 0
              ? t('{{length}} selected', { length: selectedVMs.value.length })
              : null
          }
          onChange={(event, checked) => {
            event.stopPropagation();
            if (!checked) deselectAll();
          }}
          id="select-action-dropdown"
          isChecked={partiallyChecked ? null : isChecked}
        />
      </MenuToggle>
      <Popper
        popper={
          <Menu containsFlyout ref={menuRef}>
            <MenuContent>
              <MenuList>
                <MenuItem data-test-id="select-none" onClick={() => onSelectItem()}>
                  {t('Select none (0) items')}
                </MenuItem>
                <MenuItem data-test-id="select-none" onClick={() => onSelectItem(vmsInPage)}>
                  {t('Select page ({{value}}) items', { value: pageVMCount })}
                </MenuItem>
                <MenuItem data-test-id="select-none" onClick={() => onSelectItem(vms)}>
                  {t('Select all ({{value}}) items', { value: vms.length })}
                </MenuItem>
              </MenuList>
            </MenuContent>
          </Menu>
        }
        appendTo={containerRef.current}
        isVisible={isOpen}
        triggerRef={toggleRef}
      />
    </div>
  );
};

export default VirtualMachineSelection;
