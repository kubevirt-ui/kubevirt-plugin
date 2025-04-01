import React, { FC, MouseEventHandler } from 'react';

import { Button } from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons/dist/esm/icons/pencil-alt-icon';

type VMEditWithPencilProps = {
  ButtonID?: string;
  isEdit: boolean;
  onEditClick: MouseEventHandler;
};

const VMEditWithPencil: FC<VMEditWithPencilProps> = ({
  ButtonID,
  children,
  isEdit,
  onEditClick,
}) => {
  return (
    <Button
      data-test="edit-button"
      id={ButtonID}
      isDisabled={!isEdit}
      isInline
      onClick={onEditClick}
      type="button"
      variant="link"
    >
      {children}
      {isEdit && <PencilAltIcon className="co-icon-space-l pf-v5-c-button-icon--plain" />}
    </Button>
  );
};

export default VMEditWithPencil;
