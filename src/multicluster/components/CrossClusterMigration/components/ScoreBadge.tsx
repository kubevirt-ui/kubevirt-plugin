import React, { FC } from 'react';

import { Label } from '@patternfly/react-core';

import { getScoreColor } from './utils';

const ScoreBadge: FC<{ score: number }> = ({ score }) => (
  <Label color={getScoreColor(score)}>{score.toFixed(0)}</Label>
);

export default ScoreBadge;
