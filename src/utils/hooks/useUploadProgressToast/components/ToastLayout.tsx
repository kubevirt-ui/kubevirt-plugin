import React, { type FC, type ReactNode } from 'react';

import { Flex } from '@patternfly/react-core';

type ToastLayoutProps = {
  children: ReactNode;
  dataTest?: string;
};

const ToastLayout: FC<ToastLayoutProps> = ({ children, dataTest }) => (
  <Flex data-test={dataTest} direction={{ default: 'column' }} rowGap={{ default: 'rowGapXs' }}>
    {children}
  </Flex>
);

export default ToastLayout;
