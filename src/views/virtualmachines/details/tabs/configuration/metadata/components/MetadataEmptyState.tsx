import React, { FC } from 'react';

import {
  Button,
  ButtonVariant,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
} from '@patternfly/react-core';

type MetadataEmptyStateProps = {
  addButtonLabel: string;
  dataTest: string;
  editable: boolean;
  emptyMessage: string;
  onAdd: () => void;
};

const MetadataEmptyState: FC<MetadataEmptyStateProps> = ({
  addButtonLabel,
  dataTest,
  editable,
  emptyMessage,
  onAdd,
}) => {
  return (
    <EmptyState data-test={`${dataTest}-empty`} variant="xs">
      <EmptyStateBody>{emptyMessage}</EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          {editable && (
            <Button
              data-test={`${dataTest}-add-btn`}
              onClick={onAdd}
              variant={ButtonVariant.primary}
            >
              {addButtonLabel}
            </Button>
          )}
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};

export default MetadataEmptyState;
