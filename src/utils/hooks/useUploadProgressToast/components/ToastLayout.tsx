import React, { FC, ReactNode } from 'react';

import { Flex } from '@patternfly/react-core';

const ToastLayout: FC<{ children: ReactNode }> = ({ children }) => (
  <Flex direction={{ default: 'column' }} rowGap={{ default: 'rowGapXs' }}>
    {children}
  </Flex>
);

export default ToastLayout;
