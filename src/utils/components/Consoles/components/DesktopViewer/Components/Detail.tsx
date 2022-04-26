import React from 'react';

import {
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';

import { DetailProps } from '../utils/types';

const Detail: React.FC<DetailProps> = ({ title, value }: DetailProps) => (
  <DescriptionListGroup>
    <DescriptionListTerm>{title}</DescriptionListTerm>
    <DescriptionListDescription>{value}</DescriptionListDescription>
  </DescriptionListGroup>
);

export default Detail;
