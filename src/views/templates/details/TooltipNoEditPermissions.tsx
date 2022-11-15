import React, { FC } from 'react';

import { Tooltip } from '@patternfly/react-core';

import { NO_EDIT_TEMPLATE_PERMISSIONS } from '../utils/constants';

import './tooltip-no-edit-permissions.scss';

type TooltipNoEditPermissionsProps = {
  hasEditPermission: boolean;
};

const TooltipNoEditPermissions: FC<TooltipNoEditPermissionsProps> = ({
  hasEditPermission,
  children,
}) => {
  if (!hasEditPermission) {
    return (
      <Tooltip content={NO_EDIT_TEMPLATE_PERMISSIONS}>
        {/* Span here as disabled buttons do not fire any event. We need the 'hover' event. */}
        <span>{children}</span>
      </Tooltip>
    );
  }

  return <>{children}</>;
};

export default TooltipNoEditPermissions;
