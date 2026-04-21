import React, { FC } from 'react';

import { getIconByOSName } from '@catalog/templatescatalog/utils/os-icons';
import { LINUX, OS_NAME_TYPES } from '@kubevirt-utils/resources/template';
import { Split, SplitItem } from '@patternfly/react-core';

import './BootableVolumeEmptyState.scss';

const BootableVolumeOSIcons: FC = () => {
  const linuxIcon = getIconByOSName(LINUX);
  const rhelIcon = getIconByOSName(OS_NAME_TYPES.rhel);
  const windowsIcon = getIconByOSName(OS_NAME_TYPES.windows);

  const osIcons = [linuxIcon, rhelIcon, windowsIcon];

  return (
    <Split className="bootable-volume-empty-state__icon-bar">
      {osIcons?.map((icon) => {
        return (
          <SplitItem key={icon}>
            <img alt="os-icon" className="bootable-volume-empty-state__icon" src={icon} />
          </SplitItem>
        );
      })}
    </Split>
  );
};

export default BootableVolumeOSIcons;
