import React, { FC, ReactNode } from 'react';

import { Button, ButtonVariant } from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';

type EditButtonProps = {
  ariaLabel?: string;
  children?: ReactNode;
  className?: string;
  isDisabled?: boolean;
  isInline?: boolean;
  onClick?: () => void;
  testId?: string;
  variant?: ButtonVariant;
};

const EditButton: FC<EditButtonProps> = ({
  ariaLabel,
  children,
  className,
  isDisabled,
  isInline,
  onClick,
  testId,
  variant = ButtonVariant.link,
}) => (
  <Button
    onClick={(e) => {
      e.stopPropagation();
      onClick?.();
    }}
    aria-label={ariaLabel || undefined}
    className={className}
    data-test-id={testId}
    icon={<PencilAltIcon />}
    iconPosition="end"
    isDisabled={isDisabled}
    isInline={isInline}
    variant={variant}
  >
    {children}
  </Button>
);

export default EditButton;
