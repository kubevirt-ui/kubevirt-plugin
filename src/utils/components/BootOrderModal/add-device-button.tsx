import * as React from 'react';

import { Button, ButtonVariant, Content, ContentVariants } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';

export const AddDeviceButton: React.FC<AddDeviceButtonType> = ({
  disabledMessage,
  id,
  isDisabled,
  message,
  onClick,
}) =>
  isDisabled ? (
    <Content component={ContentVariants.p}>{disabledMessage}</Content>
  ) : (
    <Button
      className="pf-m-link--align-left"
      icon={<PlusCircleIcon />}
      id={id}
      onClick={onClick}
      variant={ButtonVariant.link}
    >
      {message}
    </Button>
  );

export type AddDeviceButtonType = {
  disabledMessage: string;
  id: string;
  isDisabled: boolean;
  message: string;
  onClick: () => void;
};
