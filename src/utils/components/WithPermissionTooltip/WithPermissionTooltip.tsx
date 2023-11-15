import React, { FC, ReactElement, ReactNode } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Tooltip, TooltipPosition } from '@patternfly/react-core';

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

  return allowed ? (
    <>{children}</>
  ) : (
    <Tooltip
      content={title || t(`You don't have permission to perform this action`)}
      position={TooltipPosition.right}
    >
      <>{children}</>
    </Tooltip>
  );
};

export default WithPermissionTooltip;
