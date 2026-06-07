import React, { FC } from 'react';

import {
  Button,
  ButtonVariant,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
} from '@patternfly/react-core';

type MetadataEmptyStateProps = {
  addButtonLabel: string;
  canUpdate: boolean;
  'data-test': string;
  emptyText: string;
  onEdit: () => void;
  onToggleAdvanced: () => void;
  systemCount: number;
  systemLinkLabel: string;
};

const MetadataEmptyState: FC<MetadataEmptyStateProps> = ({
  addButtonLabel,
  canUpdate,
  'data-test': dataTest,
  emptyText,
  onEdit,
  onToggleAdvanced,
  systemCount,
  systemLinkLabel,
}) => (
  <EmptyState headingLevel="h3" variant={EmptyStateVariant.xs}>
    <EmptyStateBody>{emptyText}</EmptyStateBody>
    <EmptyStateFooter>
      <EmptyStateActions>
        {canUpdate && (
          <Button
            data-test={`${dataTest}-add-btn`}
            onClick={onEdit}
            variant={ButtonVariant.secondary}
          >
            {addButtonLabel}
          </Button>
        )}
      </EmptyStateActions>
      {systemCount > 0 && (
        <Button
          data-test="show-system-metadata-link"
          isInline
          onClick={onToggleAdvanced}
          variant={ButtonVariant.link}
        >
          {systemLinkLabel}
        </Button>
      )}
    </EmptyStateFooter>
  </EmptyState>
);

export default MetadataEmptyState;
