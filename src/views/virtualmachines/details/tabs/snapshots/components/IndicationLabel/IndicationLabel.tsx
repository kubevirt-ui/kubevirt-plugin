import React, { FC } from 'react';

import { Label, Tooltip } from '@patternfly/react-core';

import './IndicationLabel';

import { INDICATOR_STATUSES } from './constants';

type IndicationLabelProps = {
  indicationObject: { indication: string; message: string };
};

const IndicationLabel: FC<IndicationLabelProps> = ({ indicationObject }) => (
  <Tooltip content={indicationObject.message}>
    <Label status={INDICATOR_STATUSES[indicationObject.indication] || 'info'}>
      {indicationObject.indication}
    </Label>
  </Tooltip>
);

export default IndicationLabel;
