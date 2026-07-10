import type { FC, ReactNode } from 'react';
import React from 'react';

import { Flex, FlexItem } from '@patternfly/react-core';

type NodeInventoryStatusItemProps = { count: number; icon: ReactNode };

const NodeInventoryStatusItem: FC<NodeInventoryStatusItemProps> = ({ count, icon }) => {
  if (!count) {
    return null;
  }

  return (
    <Flex
      alignItems={{ default: 'alignItemsCenter' }}
      direction={{ default: 'row' }}
      flexWrap={{ default: 'wrap' }}
      spaceItems={{ default: 'spaceItemsSm' }}
    >
      <FlexItem>{count}</FlexItem>
      <FlexItem>{icon}</FlexItem>
    </Flex>
  );
};
export default NodeInventoryStatusItem;
