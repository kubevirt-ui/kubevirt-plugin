import React, { FC, memo, useState } from 'react';

import ActionDropdownItem from '@kubevirt-utils/components/ActionDropdownItem/ActionDropdownItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Action } from '@openshift-console/dynamic-plugin-sdk';
import { Dropdown, DropdownToggle, KebabToggle } from '@patternfly/react-core';

import './VirtualMachineActions.scss';

type VirtualMachinesInstanceActionsProps = {
  actions: Action[];
  isKebabToggle?: boolean;
};

const VirtualMachineActions: FC<VirtualMachinesInstanceActionsProps> = ({
  actions = [],
  isKebabToggle,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dropdown
      dropdownItems={actions?.map((action) => (
        <ActionDropdownItem action={action} key={action?.id} setIsOpen={setIsOpen} />
      ))}
      toggle={
        isKebabToggle ? (
          <KebabToggle onToggle={setIsOpen} />
        ) : (
          <DropdownToggle onToggle={setIsOpen}>{t('Actions')}</DropdownToggle>
        )
      }
      className="VirtualMachineActions"
      data-test-id="virtual-machine-actions"
      isFlipEnabled
      isOpen={isOpen}
      isPlain={isKebabToggle}
      menuAppendTo="parent"
    />
  );
};

export default memo(VirtualMachineActions);
