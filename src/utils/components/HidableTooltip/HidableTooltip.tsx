import React, { FC, ReactNode } from 'react';

import { Tooltip, TooltipPosition } from '@patternfly/react-core';

type HidableTooltipProps = {
  children: ReactNode;
  content: ReactNode;
  hidden: boolean;
  position?: TooltipPosition;
};

const HidableTooltip: FC<HidableTooltipProps> = ({
  children,
  content,
  hidden,
  position = TooltipPosition.right,
}) => {
  return hidden ? (
    <>{children}</>
  ) : (
    <Tooltip content={content} position={position}>
      <>{children}</>
    </Tooltip>
  );
};

export default HidableTooltip;
