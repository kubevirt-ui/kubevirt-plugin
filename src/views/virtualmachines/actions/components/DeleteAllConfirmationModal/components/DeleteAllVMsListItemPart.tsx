import type { FC, ReactNode } from 'react';

import { Flex, FlexItem } from '@patternfly/react-core';

type DeleteAllVmsListPartProps = {
  ariaLabel: string;
  icon: ReactNode;
  text?: string;
};

export const DeleteAllVMsListItemPart: FC<DeleteAllVmsListPartProps> = ({
  ariaLabel,
  icon,
  text,
}) => (
  <FlexItem aria-label={ariaLabel} spacer={{ default: 'spacerSm' }}>
    <Flex>
      <FlexItem spacer={{ default: 'spacerSm' }}>{icon}</FlexItem>
      <FlexItem>{text}</FlexItem>
    </Flex>
  </FlexItem>
);
