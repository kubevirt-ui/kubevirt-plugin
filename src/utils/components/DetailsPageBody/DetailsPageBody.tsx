// This is a Console component https://github.com/openshift/console/blob/main/frontend/packages/console-shared/src/components/layout/PageBody.tsx

import React from 'react';
import classNames from 'classnames';

import { Flex } from '@patternfly/react-core';

type DetailsPageBodyProps = {
  children: React.ReactNode;
  className?: string;
};

const DetailsPageBody: React.FC<DetailsPageBodyProps> = ({ children, className, ...props }) => {
  return (
    <Flex
      className={classNames('co-m-page__body', className)}
      direction={{ default: 'column' }}
      flexWrap={{ default: 'nowrap' }}
      rowGap={{ default: 'rowGapNone' }}
      style={{ flex: '1 0 auto' }}
      {...props}
    >
      {children}
    </Flex>
  );
};

export default DetailsPageBody;
