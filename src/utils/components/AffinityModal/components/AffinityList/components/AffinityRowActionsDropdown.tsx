import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Dropdown, DropdownItem, DropdownPosition, KebabToggle } from '@patternfly/react-core';

import { AffinityRowData } from '../../../utils/types';

type AffinityRowActionsDropdownProps = {
  affinity: AffinityRowData;
  onDelete: (affinity: AffinityRowData) => void;
  onEdit: (affinity: AffinityRowData) => void;
};

const AffinityRowActionsDropdown: React.FC<AffinityRowActionsDropdownProps> = ({
  affinity,
  onDelete,
  onEdit,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleDelete = () => {
    onDelete(affinity);
    setIsOpen(false);
  };
  return (
    <Dropdown
      dropdownItems={[
        <DropdownItem key="edit" onClick={() => onEdit(affinity)}>
          {t('Edit')}
        </DropdownItem>,
        <DropdownItem key="delete" onClick={() => handleDelete()}>
          {t('Delete')}
        </DropdownItem>,
      ]}
      isOpen={isOpen}
      isPlain
      menuAppendTo={document.getElementById('tab-modal')}
      position={DropdownPosition.right}
      toggle={<KebabToggle onToggle={setIsOpen} />}
    />
  );
};

export default AffinityRowActionsDropdown;
