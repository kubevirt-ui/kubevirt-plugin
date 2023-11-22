import * as React from 'react';

import { Label } from '@patternfly/react-core';

import './IndicationLabel';

type IndicationLabelProps = {
  indication: string;
};

const IndicationLabel: React.FC<IndicationLabelProps> = ({ indication }) => {
  return (
    <Label color="purple" isTruncated>
      {indication}
    </Label>
  );
};

export default IndicationLabel;
