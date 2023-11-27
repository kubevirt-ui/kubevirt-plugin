import * as React from 'react';

import {
  Alert,
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateSecondaryActions,
  EmptyStateVariant,
  Title,
} from '@patternfly/react-core';

// Display and empty with a Call to add new source if no sources are defined.
export const BootOrderEmptyState: React.FC<BootOrderEmptyProps> = ({
  addItemDisabledMessage,
  addItemIsDisabled,
  addItemMessage,
  message,
  onClick,
  title,
}) => (
  <EmptyState variant={EmptyStateVariant.full}>
    <Title headingLevel="h5" size="lg">
      {title}
    </Title>
    <EmptyStateBody>{message}</EmptyStateBody>
    <EmptyStateSecondaryActions>
      {!addItemIsDisabled ? (
        <Button onClick={onClick} variant="secondary">
          {addItemMessage}
        </Button>
      ) : (
        <Alert title={addItemDisabledMessage} variant="info" />
      )}
    </EmptyStateSecondaryActions>
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
