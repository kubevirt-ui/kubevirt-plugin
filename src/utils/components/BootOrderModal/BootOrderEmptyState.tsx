import React, { FC } from 'react';

import {
  Alert,
  AlertVariant,
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateVariant,
} from '@patternfly/react-core';

// Display and empty with a Call to add new source if no sources are defined.
export const BootOrderEmptyState: FC<BootOrderEmptyProps> = ({
  addItemDisabledMessage,
  addItemIsDisabled,
  addItemMessage,
  message,
  onClick,
  title,
}) => (
  <EmptyState variant={EmptyStateVariant.full}>
    <EmptyStateHeader headingLevel="h5" titleText={<>{title}</>} />
    <EmptyStateBody>{message}</EmptyStateBody>
    <EmptyStateFooter>
      <EmptyStateActions>
        {!addItemIsDisabled ? (
          <Button onClick={onClick} variant="secondary">
            {addItemMessage}
          </Button>
        ) : (
          <Alert title={addItemDisabledMessage} variant={AlertVariant.info} />
        )}
      </EmptyStateActions>
    </EmptyStateFooter>
  </EmptyState>
);

export type BootOrderEmptyProps = {
  addItemDisabledMessage?: string;
  addItemIsDisabled: boolean;
  addItemMessage: string;
  message: string;
  onClick: () => void;
  title: string;
};
