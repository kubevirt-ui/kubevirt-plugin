import React, { FC } from 'react';

import { Flex } from '@patternfly/react-core';

const PaneHeading: FC = ({ children }) => (
  <Flex
    alignItems={{ default: 'alignItemsCenter' }}
    justifyContent={{ default: 'justifyContentSpaceBetween' }}
  >
    {children}
  </Flex>
);

export default PaneHeading;
