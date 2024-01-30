import React, { FC, useState } from 'react';

import { V1beta1VirtualMachineInstancetype } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ActionDropdownItem from '@kubevirt-utils/components/ActionDropdownItem/ActionDropdownItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getContentScrollableElement } from '@kubevirt-utils/utils/utils';
import { Dropdown, DropdownPosition, DropdownToggle, KebabToggle } from '@patternfly/react-core';

import useUserInstancetypeActionsProvider from './hooks/useUserInstancetypeActionsProvider';

type UserInstancetypeActionsProps = {
  instanceType: V1beta1VirtualMachineInstancetype;
  isKebabToggle?: boolean;
};

const UserInstancetypeActions: FC<UserInstancetypeActionsProps> = ({
  instanceType,
  isKebabToggle,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [actions] = useUserInstancetypeActionsProvider(instanceType);

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
      data-test-id="virtual-machine-user-instance-type-actions"
      isOpen={isOpen}
      isPlain={isKebabToggle}
      menuAppendTo={getContentScrollableElement}
      position={DropdownPosition.right}
    />
  );
};

export default UserInstancetypeActions;
