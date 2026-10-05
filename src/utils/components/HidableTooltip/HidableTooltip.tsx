import type { FC, ReactNode } from 'react';

import { Tooltip, TooltipPosition } from '@patternfly/react-core';

type HidableTooltipProps = {
  children?: ReactNode;
  className?: string;
  content: ReactNode;
  hidden: boolean;
  position?: TooltipPosition;
};

const HidableTooltip: FC<HidableTooltipProps> = ({
  children,
  className,
  content,
  hidden,
  position = TooltipPosition.right,
}) => {
  return hidden ? (
    <>{children}</>
  ) : (
    <Tooltip content={content} position={position}>
      <span className={className}>{children}</span>
    </Tooltip>
  );
};

export default HidableTooltip;
