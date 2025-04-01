import React, { FC, MouseEvent } from 'react';

import { Button } from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';

type EditButtonProps = {
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  testId?: string;
};

const EditButton: FC<EditButtonProps> = ({ children, onClick, testId }) => (
  <Button
    data-test={testId ? `${testId}-details-item__edit-button` : 'details-item__edit-button'}
    isInline
    onClick={onClick}
    type="button"
    variant="link"
  >
    {children}
    <PencilAltIcon className="co-icon-space-l pf-v5-c-button-icon--plain" />
  </Button>
);

export default EditButton;
