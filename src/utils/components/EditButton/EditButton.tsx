import { type FC, type ReactElement, type ReactNode } from 'react';

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
}): ReactElement => (
  <Button
    aria-label={ariaLabel ?? undefined}
    className={className}
    data-test={testId}
    icon={<PencilAltIcon />}
    iconPosition="end"
    isDisabled={isDisabled}
    isInline={isInline}
    onClick={(e) => {
      e.stopPropagation();
      onClick?.();
    }}
    variant={variant}
  >
    {children}
  </Button>
);

export default EditButton;
