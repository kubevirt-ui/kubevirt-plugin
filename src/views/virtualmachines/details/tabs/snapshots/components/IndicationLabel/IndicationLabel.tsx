import React, { FC } from 'react';

import { Label } from '@patternfly/react-core';

import './IndicationLabel';

type IndicationLabelProps = {
  indication: string;
};

const IndicationLabel: FC<IndicationLabelProps> = ({ indication }) => (
  <Label color="purple">{indication}</Label>
);

export default IndicationLabel;
