import React, { FCC } from 'react';

import { Flex } from '@patternfly/react-core';

const PaneHeading: FCC = ({ children }) => (
  <Flex
    alignItems={{ default: 'alignItemsCenter' }}
    justifyContent={{ default: 'justifyContentSpaceBetween' }}
  >
    {children}
  </Flex>
);

export default PaneHeading;
