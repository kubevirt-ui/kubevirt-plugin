import React, { type FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, Icon, Label } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';

import { ConfigurationStatus } from '../../utils/types';

type ConfigurationStatusCellProps = {
  configStatus: ConfigurationStatus | undefined;
  onReviewClick?: () => void;
};

const ConfigurationStatusCell: FC<ConfigurationStatusCellProps> = ({
  configStatus,
  onReviewClick,
}) => {
  const { t } = useKubevirtTranslation();

  if (configStatus === ConfigurationStatus.Recommended) {
    return (
      <Label color="green" data-test="configuration-status" isCompact>
        {t('Recommended')}
      </Label>
    );
  }

  if (configStatus === ConfigurationStatus.Manual) {
    return (
      <>
        <Icon status="warning">
          <ExclamationTriangleIcon />
        </Icon>{' '}
        <span data-test="configuration-status">{t('Manual')}</span>
        {onReviewClick && (
          <>
            {' '}
            <Button
              data-test="review-recommendation"
              isInline
              onClick={onReviewClick}
              variant="link"
            >
              {t('Review recommendation')}
            </Button>
          </>
        )}
      </>
    );
  }

  return <span data-test="configuration-status">-</span>;
};

export default ConfigurationStatusCell;
