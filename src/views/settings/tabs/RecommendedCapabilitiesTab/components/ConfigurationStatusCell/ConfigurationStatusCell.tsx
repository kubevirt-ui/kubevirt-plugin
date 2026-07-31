import React, { FC } from 'react';

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
      <Label color="green" isCompact>
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
        {t('Manual')}
        {onReviewClick && (
          <>
            {' '}
            <Button isInline onClick={onReviewClick} variant="link">
              {t('Review recommendation')}
            </Button>
          </>
        )}
      </>
    );
  }

  return <>-</>;
};

export default ConfigurationStatusCell;
