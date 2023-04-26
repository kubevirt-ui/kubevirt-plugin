import React, { FC, useState } from 'react';

import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { V1alpha2VirtualMachineClusterPreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getContentScrollableElement } from '@kubevirt-utils/utils/utils';
import { Action } from '@openshift-console/dynamic-plugin-sdk';
import { Dropdown, DropdownItem, DropdownPosition, KebabToggle } from '@patternfly/react-core';

import useBootableVolumesActions from './hooks/useBootableVolumesActions';

type BootableVolumesActionsProps = {
  dataSource: V1beta1DataSource;
  preferences: V1alpha2VirtualMachineClusterPreference[];
};

const BootableVolumesActions: FC<BootableVolumesActionsProps> = ({ dataSource, preferences }) => {
  const [actions] = useBootableVolumesActions(dataSource, preferences);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleClick = (action: Action) => {
    if (typeof action?.cta === 'function') {
      action?.cta();
      setIsOpen(false);
    }
  };

  return (
    <Dropdown
      menuAppendTo={getContentScrollableElement}
      isPlain
      isOpen={isOpen}
      position={DropdownPosition.right}
      toggle={<KebabToggle onToggle={setIsOpen} />}
      dropdownItems={actions?.map((action) => (
        <DropdownItem
          key={action?.id}
          onClick={() => handleClick(action)}
          isDisabled={action?.disabled}
          description={action?.description}
        >
          {action?.label}
        </DropdownItem>
      ))}
    />
  );
};

export default BootableVolumesActions;
