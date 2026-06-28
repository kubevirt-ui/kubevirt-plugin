import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
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
  canUpdate: boolean;
  metadataType: 'annotations' | 'labels';
  onEdit: () => void;
  onShowAdvancedView: () => void;
  systemCount: number;
};

const MetadataEmptyState: FC<MetadataEmptyStateProps> = ({
  canUpdate,
  metadataType,
  onEdit,
  onShowAdvancedView,
  systemCount,
}) => {
  const { t } = useKubevirtTranslation();

  const isLabels = metadataType === 'labels';
  const addButtonLabel = isLabels ? t('Add label') : t('Add annotation');
  const emptyText = isLabels ? t('No labels yet.') : t('No annotations yet.');
  const systemLinkLabel = isLabels
    ? t('Show advanced view for system labels ({{count}})', { count: systemCount })
    : t('Show advanced view for system annotations ({{count}})', { count: systemCount });

  return (
    <EmptyState headingLevel="h3" variant={EmptyStateVariant.xs}>
      <EmptyStateBody>{emptyText}</EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          {canUpdate && (
            <Button
              data-test={`${metadataType}-add-btn`}
              onClick={onEdit}
              variant={ButtonVariant.secondary}
            >
              {addButtonLabel}
            </Button>
          )}
        </EmptyStateActions>
        {!!systemCount && (
          <Button
            data-test={`${metadataType}-show-system-link`}
            isInline
            onClick={onShowAdvancedView}
            variant={ButtonVariant.link}
          >
            {systemLinkLabel}
          </Button>
        )}
      </EmptyStateFooter>
    </EmptyState>
  );
};

export default MetadataEmptyState;
