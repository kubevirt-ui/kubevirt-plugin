import React, { FC, useState } from 'react';

import { V1alpha2VirtualMachineClusterPreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getContentScrollableElement } from '@kubevirt-utils/utils/utils';
import { Action } from '@openshift-console/dynamic-plugin-sdk';
import { Dropdown, DropdownItem, DropdownPosition, KebabToggle } from '@patternfly/react-core';

import { BootableResource } from '../utils/types';

import useBootableVolumesActions from './hooks/useBootableVolumesActions';

type BootableVolumesActionsProps = {
  preferences: V1alpha2VirtualMachineClusterPreference[];
  source: BootableResource;
};

const BootableVolumesActions: FC<BootableVolumesActionsProps> = ({ preferences, source }) => {
  const [actions] = useBootableVolumesActions(source, preferences);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleClick = (action: Action) => {
    if (typeof action?.cta === 'function') {
      action?.cta();
      setIsOpen(false);
    }
  };

  return (
    <Dropdown
      dropdownItems={actions?.map((action) => (
        <DropdownItem
          description={action?.description}
          isDisabled={action?.disabled}
          key={action?.id}
          onClick={() => handleClick(action)}
        >
          {action?.label}
        </DropdownItem>
      ))}
      isOpen={isOpen}
      isPlain
      menuAppendTo={getContentScrollableElement}
      position={DropdownPosition.right}
      toggle={<KebabToggle onToggle={setIsOpen} />}
    />
  );
};

export default BootableVolumesActions;
