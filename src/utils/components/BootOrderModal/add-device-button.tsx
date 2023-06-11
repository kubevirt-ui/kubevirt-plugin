import * as React from 'react';

import { Button, Text, TextVariants } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';

export const AddDeviceButton: React.FC<AddDeviceButtonType> = ({
  disabledMessage,
  id,
  isDisabled,
  message,
  onClick,
}) =>
  isDisabled ? (
    <Text component={TextVariants.p}>{disabledMessage}</Text>
  ) : (
    <Button
      className="pf-m-link--align-left"
      icon={<PlusCircleIcon />}
      id={id}
      onClick={onClick}
      variant="link"
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
