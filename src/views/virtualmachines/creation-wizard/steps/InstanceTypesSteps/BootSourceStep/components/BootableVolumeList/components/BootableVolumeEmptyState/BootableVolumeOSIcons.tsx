import React, { FC } from 'react';

import { LINUX, OS_NAME_TYPES } from '@kubevirt-utils/resources/template';
import { Split, SplitItem } from '@patternfly/react-core';
import { getIconByOSName } from '@virtualmachines/creation-wizard/utils/os-icons/os-icons';

import './BootableVolumeEmptyState.scss';

type BootableVolumeOSIconsProps = {
  osName?: string;
};

const BootableVolumeOSIcons: FC<BootableVolumeOSIconsProps> = ({ osName }) => {
  if (osName) {
    const icon = getIconByOSName(osName);
    if (icon) {
      return (
        <Split className="bootable-volume-empty-state__icon-bar">
          <SplitItem>
            <img alt="" className="bootable-volume-empty-state__icon" src={icon} />
          </SplitItem>
        </Split>
      );
    }
  }

  const osIcons = [
    getIconByOSName(LINUX),
    getIconByOSName(OS_NAME_TYPES.rhel),
    getIconByOSName(OS_NAME_TYPES.windows),
  ];

  return (
    <Split className="bootable-volume-empty-state__icon-bar">
      {osIcons?.map((icon) => (
        <SplitItem key={icon}>
          <img alt="" className="bootable-volume-empty-state__icon" src={icon} />
        </SplitItem>
      ))}
    </Split>
  );
};

export default BootableVolumeOSIcons;
