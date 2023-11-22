import React, { ComponentClass, FC } from 'react';

import { Divider, DrilldownMenu, MenuItem } from '@patternfly/react-core';

type DrilldownMenuItemProps = {
  Icon?: ComponentClass;
  id: string;
  label: string;
};

const DrilldownMenuItem: FC<DrilldownMenuItemProps> = ({ children, Icon, id, label }) => (
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

export default DrilldownMenuItem;
