import React, { FC, ReactElement, ReactNode } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNoPermissionTooltipContent } from '@kubevirt-utils/utils/utils';
import { TooltipPosition } from '@patternfly/react-core';

import HidableTooltip from '../HidableTooltip/HidableTooltip';

type WithPermissionTooltipProps = {
  allowed: boolean;
  children: ReactNode;
  title?: string;
};

const WithPermissionTooltip: FC<WithPermissionTooltipProps> = ({
  allowed,
  children,
  title,
}): ReactElement => {
  const { t } = useKubevirtTranslation();

  return (
    <HidableTooltip
      content={title || getNoPermissionTooltipContent(t)}
      hidden={allowed}
      position={TooltipPosition.right}
    >
      <>{children}</>
    </HidableTooltip>
  );
};

export default WithPermissionTooltip;
