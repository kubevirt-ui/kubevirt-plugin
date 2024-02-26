import React, { FC, memo, useState } from 'react';

import ActionDropdownItem from '@kubevirt-utils/components/ActionDropdownItem/ActionDropdownItem';
import DropdownToggle from '@kubevirt-utils/components/toggles/DropdownToggle';
import KebabToggle from '@kubevirt-utils/components/toggles/KebabToggle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Action } from '@openshift-console/dynamic-plugin-sdk';
import { Dropdown, DropdownList } from '@patternfly/react-core';

type ActionsDropdownProps = {
  actions: Action[];
  className?: string;
  id?: string;
  isKebabToggle?: boolean;
  onLazyClick?: () => void;
};

const ActionsDropdown: FC<ActionsDropdownProps> = ({
  actions = [],
  className,
  id,
  isKebabToggle,
  onLazyClick,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const onToggle = () => {
    setIsOpen((prevIsOpen) => {
      if (onLazyClick && !prevIsOpen) onLazyClick();

      return !prevIsOpen;
    });
  };

  const Toggle = isKebabToggle
    ? KebabToggle({ isExpanded: isOpen, onClick: onToggle })
    : DropdownToggle({
        children: t('Actions'),
        isExpanded: isOpen,
        onClick: onToggle,
      });

  return (
    <Dropdown
      className={className}
      data-test-id={id}
      isOpen={isOpen}
      onOpenChange={(open: boolean) => setIsOpen(open)}
      popperProps={{ enableFlip: true, position: 'right' }}
      toggle={Toggle}
    >
      <DropdownList>
        {actions?.map((action) => (
          <ActionDropdownItem action={action} key={action?.id} setIsOpen={setIsOpen} />
        ))}
      </DropdownList>
    </Dropdown>
  );
};

export default memo(ActionsDropdown);
