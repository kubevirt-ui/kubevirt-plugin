import React, { ComponentClass, FC } from 'react';

import { Divider, DrilldownMenu, MenuItem } from '@patternfly/react-core';

type DrilldownMenuItemProps = {
  id: string;
  label: string;
  Icon?: ComponentClass;
};

const DrilldownMenuItem: FC<DrilldownMenuItemProps> = ({ children, id, label, Icon }) => (
  <MenuItem
    itemId={id}
    icon={Icon && <Icon />}
    direction="down"
    drilldownMenu={
      <DrilldownMenu id={id}>
        <MenuItem itemId={`${id}_breadcrumb`} direction="up">
          {label}
        </MenuItem>
        <Divider component="li" />
        {children}
      </DrilldownMenu>
    }
  >
    {label}
  </MenuItem>
);

export default DrilldownMenuItem;
