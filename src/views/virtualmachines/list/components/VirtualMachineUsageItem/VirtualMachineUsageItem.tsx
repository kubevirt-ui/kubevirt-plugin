import React, { FC } from 'react';

import { Stack } from '@patternfly/react-core';

import './VirtualMachineUsageItem.scss';

type VirtualMachineUsageItemProps = {
  capacityText: string;
  metricName: string;
  usageText: string;
};

const VirtualMachineUsageItem: FC<VirtualMachineUsageItemProps> = ({
  capacityText,
  metricName,
  usageText,
}) => (
  <Stack className="vm-usage-item" span={4}>
    <div className="vm-usage-item__metric">{metricName}</div>
    <div className="vm-usage-item__current">{usageText}</div>
    <div className="vm-usage-item__total">{capacityText}</div>
  </Stack>
);

export default VirtualMachineUsageItem;
