import React, { FC, useState } from 'react';

import { V1alpha2VirtualMachineClusterInstancetype } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ActionDropdownItem from '@kubevirt-utils/components/ActionDropdownItem/ActionDropdownItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getContentScrollableElement } from '@kubevirt-utils/utils/utils';
import { Dropdown, DropdownPosition, DropdownToggle, KebabToggle } from '@patternfly/react-core';

import useClusterInstancetypeActionsProvider from './hooks/useClusterInstancetypeActionsProvider';

type ClusterInstancetypeActionsProps = {
  instanceType: V1alpha2VirtualMachineClusterInstancetype;
  isKebabToggle?: boolean;
};

const ClusterInstancetypeActions: FC<ClusterInstancetypeActionsProps> = ({
  instanceType,
  isKebabToggle,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [actions] = useClusterInstancetypeActionsProvider(instanceType);

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
      data-test-id="virtual-machine-cluster-instance-type-actions"
      isOpen={isOpen}
      isPlain={isKebabToggle}
      menuAppendTo={getContentScrollableElement}
      position={DropdownPosition.right}
    />
  );
};

export default ClusterInstancetypeActions;
