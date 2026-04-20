import React, { FCC } from 'react';

import { FlexItem, Label } from '@patternfly/react-core';

type DiskLabelProps = {
  text: string;
};

const DiskLabel: FCC<DiskLabelProps> = ({ text }) => (
  <FlexItem>
    <Label color="blue" variant="filled">
      {text}
    </Label>
  </FlexItem>
);

export default DiskLabel;
