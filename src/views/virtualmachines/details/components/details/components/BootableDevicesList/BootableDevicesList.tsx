import * as React from 'react';

import { List, ListComponent, ListItem, OrderType } from '@patternfly/react-core';

import { BootableDeviceType } from '../../utils/bootOrderHelper';

type BootableDevicesListProps = {
  devices: BootableDeviceType[];
};

const BootableDevicesList: React.FC<BootableDevicesListProps> = ({ devices }) => (
  <List component={ListComponent.ol} type={OrderType.number}>
    {devices?.map((device) => (
      <ListItem key={`${device?.value?.name}-${device?.value?.bootOrder}`}>
        {device?.value?.name}
      </ListItem>
    ))}
  </List>
);

export default BootableDevicesList;
