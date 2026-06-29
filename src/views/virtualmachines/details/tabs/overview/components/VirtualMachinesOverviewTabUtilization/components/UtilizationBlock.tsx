import React from 'react';

import { Flex } from '@patternfly/react-core';

type UtilizationBlockProps = {
  dataTestId: string;
  isNetworkUtil?: boolean;
  title: string;
  usageValue: string;
  usedOfTotalText: string;
};

export const UtilizationBlock: React.FC<UtilizationBlockProps> = ({
  children,
  dataTestId,
  isNetworkUtil = false,
  title,
  usageValue,
  usedOfTotalText,
}) => {
  return (
    <div className="util">
      <div className="pf-v6-u-pl-lg">
        <div className="pf-v6-u-pb-sm">{title}</div>
        <Flex
          data-test-id={dataTestId}
          direction={isNetworkUtil ? null : { default: 'column' }}
          spaceItems={isNetworkUtil ? null : { default: 'spaceItemsNone' }}
        >
          <div className="pf-v6-u-font-size-xl">{usageValue}</div>
          <div className="pf-v6-u-text-color-subtle">{usedOfTotalText}</div>
        </Flex>
      </div>
      {isNetworkUtil ? children : <div className="util-chart">{children}</div>}
    </div>
  );
};
