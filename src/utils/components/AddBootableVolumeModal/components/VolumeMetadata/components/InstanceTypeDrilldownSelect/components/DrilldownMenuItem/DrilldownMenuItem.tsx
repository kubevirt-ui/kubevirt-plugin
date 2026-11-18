import React, { type ComponentClass, type FC, type ReactElement, type ReactNode } from 'react';

import { Divider, DrilldownMenu, MenuItem } from '@patternfly/react-core';

type DrilldownMenuItemProps = {
  children?: ReactNode;
  icon?: ComponentClass;
  id: string;
  label: ReactNode;
};

const DrilldownMenuItem: FC<DrilldownMenuItemProps> = ({
  children,
  icon,
  id,
  label,
}): ReactElement => {
  const Icon = icon;
  return (
    <MenuItem
      drilldownMenu={
        <DrilldownMenu id={id}>
          <MenuItem direction="up" itemId={`${id}_breadcrumb`}>
            {label}
          </MenuItem>
          <Divider component="li" />
          {children}
        </DrilldownMenu>
      }
      direction="down"
      icon={Icon && <Icon />}
      itemId={id}
    >
      {label}
    </MenuItem>
  );
};

export default DrilldownMenuItem;
