import React, { FC, Ref, useState } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { PaginationState } from '@kubevirt-utils/hooks/usePagination/utils/types';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  Checkbox,
  Dropdown,
  MenuItem,
  MenuToggle,
  MenuToggleElement,
} from '@patternfly/react-core';
import useExistingSelectedVMs from '@virtualmachines/list/hooks/useExistingSelectedVMs';

import { deselectAll, selectAll } from '../../selectedVMs';

import './virtual-machine-selection.scss';

type VirtualMachineSelectionProps = {
  loaded?: boolean;
  pagination: PaginationState;
  vms: V1VirtualMachine[];
};

const VirtualMachineSelection: FC<VirtualMachineSelectionProps> = ({ loaded, pagination, vms }) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const existingSelectedVMs = useExistingSelectedVMs(vms);

  if (!loaded) return null;

  const onToggle = () => {
    setIsOpen((prevIsOpen) => !prevIsOpen);
  };

  const onSelectItem = (vmsToSelect?: V1VirtualMachine[]) => {
    vmsToSelect ? selectAll(vmsToSelect) : deselectAll();

    setIsOpen(false);
  };

  const currentPageVMs = vms?.slice(pagination.startIndex, pagination.endIndex);

  const numCurrentPageVMs = currentPageVMs.length;

  const selectionIsEmpty = isEmpty(existingSelectedVMs);
  const isChecked = !selectionIsEmpty && existingSelectedVMs.length === vms.length;
  const partiallyChecked = !selectionIsEmpty && !isChecked;

  return (
    <Dropdown
      toggle={(toggleRef: Ref<MenuToggleElement>) => (
        <MenuToggle
          className="virtual-machine-selection"
          isExpanded={isOpen}
          onClick={onToggle}
          ref={toggleRef}
        >
          <Checkbox
            label={
              !selectionIsEmpty
                ? t('{{length}} selected', { length: existingSelectedVMs.length })
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
      )}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      shouldFocusToggleOnSelect
    >
      <MenuItem data-test-id="select-none" onClick={() => onSelectItem()}>
        {t('Select none (0) items')}
      </MenuItem>
      <MenuItem data-test-id="select-page" onClick={() => onSelectItem(currentPageVMs)}>
        {t('Select page ({{value}}) items', { value: numCurrentPageVMs })}
      </MenuItem>
      <MenuItem data-test-id="select-all" onClick={() => onSelectItem(vms)}>
        {t('Select all ({{value}}) items', { value: vms.length })}
      </MenuItem>
    </Dropdown>
  );
};

export default VirtualMachineSelection;
