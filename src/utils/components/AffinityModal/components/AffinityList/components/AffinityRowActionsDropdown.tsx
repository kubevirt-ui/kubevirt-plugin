import React, { FC, useState } from 'react';

import KebabToggle from '@kubevirt-utils/components/toggles/KebabToggle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Dropdown, DropdownItem, DropdownList } from '@patternfly/react-core';

import { AffinityRowData } from '../../../utils/types';

type AffinityRowActionsDropdownProps = {
  affinity: AffinityRowData;
  onDelete: (affinity: AffinityRowData) => void;
  onEdit: (affinity: AffinityRowData) => void;
};

const AffinityRowActionsDropdown: FC<AffinityRowActionsDropdownProps> = ({
  affinity,
  onDelete,
  onEdit,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const onToggle = () => setIsOpen((prevIsOpen) => !prevIsOpen);
  const handleDelete = () => {
    onDelete(affinity);
    setIsOpen(false);
  };
  return (
    <Dropdown
      isOpen={isOpen}
      onOpenChange={(open: boolean) => setIsOpen(open)}
      toggle={KebabToggle({ isExpanded: isOpen, onClick: onToggle })}
    >
      <DropdownList>
        <DropdownItem key="edit" onClick={() => onEdit(affinity)}>
          {t('Edit')}
        </DropdownItem>
        <DropdownItem key="delete" onClick={() => handleDelete()}>
          {t('Delete')}
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );
};

export default AffinityRowActionsDropdown;
