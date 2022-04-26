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
  title,
  message,
  addItemMessage,
  addItemIsDisabled,
  addItemDisabledMessage,
  onClick,
}) => (
  <EmptyState variant={EmptyStateVariant.full}>
    <Title headingLevel="h5" size="lg">
      {title}
    </Title>
    <EmptyStateBody>{message}</EmptyStateBody>
    <EmptyStateSecondaryActions>
      {!addItemIsDisabled ? (
        <Button variant="secondary" onClick={onClick}>
          {addItemMessage}
        </Button>
      ) : (
        <Alert variant="info" title={addItemDisabledMessage} />
      )}
    </EmptyStateSecondaryActions>
  </EmptyState>
);

export type BootOrderEmptyProps = {
  title: string;
  message: string;
  addItemMessage: string;
  addItemIsDisabled: boolean;
  addItemDisabledMessage?: string;
  onClick: () => void;
};
