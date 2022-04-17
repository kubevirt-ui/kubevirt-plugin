import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Dropdown, DropdownItem, DropdownPosition, KebabToggle } from '@patternfly/react-core';

import { AffinityRowData } from '../../../utils/types';

type AffinityRowActionsDropdownProps = {
  affinity: AffinityRowData;
  onEdit: (affinity: AffinityRowData) => void;
  onDelete: (affinity: AffinityRowData) => void;
};

const AffinityRowActionsDropdown: React.FC<AffinityRowActionsDropdownProps> = ({
  affinity,
  onEdit,
  onDelete,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleDelete = () => {
    onDelete(affinity);
    setIsOpen(false);
  };
  return (
    <Dropdown
      menuAppendTo={document.getElementById('tab-modal')}
      isOpen={isOpen}
      toggle={<KebabToggle onToggle={setIsOpen} />}
      isPlain
      position={DropdownPosition.right}
      dropdownItems={[
        <DropdownItem key="edit" onClick={() => onEdit(affinity)}>
          {t('Edit')}
        </DropdownItem>,
        <DropdownItem key="delete" onClick={() => handleDelete()}>
          {t('Delete')}
        </DropdownItem>,
      ]}
    />
  );
};

export default AffinityRowActionsDropdown;
