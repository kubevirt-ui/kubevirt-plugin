import React, { FC } from 'react';

import { Button } from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';

type EditButtonProps = {
  isDisabled?: boolean;
  isInline?: boolean;
  onClick?: () => void;
  testId?: string;
};

const EditButton: FC<EditButtonProps> = ({ children, isDisabled, isInline, onClick, testId }) => (
  <Button
    onClick={(e) => {
      e.stopPropagation();
      onClick?.();
    }}
    data-test-id={testId}
    icon={<PencilAltIcon />}
    iconPosition="end"
    isDisabled={isDisabled}
    isInline={isInline}
    variant="link"
  >
    {children}
  </Button>
);

export default EditButton;
