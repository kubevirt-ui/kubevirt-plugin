import React, { FC } from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { Button, ButtonProps, Tooltip } from '@patternfly/react-core';

import { NO_EDIT_TEMPLATE_PERMISSIONS } from '../utils/constants';

import useEditTemplateAccessReview from './hooks/useIsTemplateEditable';

import './tooltip-no-edit-permissions.scss';

type ButtonWithPermissionTooltip = ButtonProps & {
  template: V1Template;
};

const ButtonWithPermissionTooltip: FC<ButtonWithPermissionTooltip> = ({
  template,
  ...buttonProps
}) => {
  const { hasEditPermission, isTemplateEditable } = useEditTemplateAccessReview(template);

  const isButtonDisabled = buttonProps.isDisabled || !isTemplateEditable;

  if (!hasEditPermission) {
    return (
      <Tooltip content={NO_EDIT_TEMPLATE_PERMISSIONS}>
        {/* Span here as disabled buttons do not fire any event. We need the 'hover' event. */}
        <span>
          <Button {...buttonProps} isDisabled={isButtonDisabled} />
        </span>
      </Tooltip>
    );
  }

  return <Button {...buttonProps} isDisabled={isButtonDisabled} />;
};

export default ButtonWithPermissionTooltip;
