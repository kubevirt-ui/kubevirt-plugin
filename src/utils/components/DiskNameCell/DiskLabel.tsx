import React, { FC } from 'react';

import { FlexItem, Label } from '@patternfly/react-core';

type DiskLabelProps = {
  text: string;
};

const DiskLabel: FC<DiskLabelProps> = ({ text }) => (
  <FlexItem>
    <Label color="blue" variant="filled">
      {text}
    </Label>
  </FlexItem>
);

export default DiskLabel;
