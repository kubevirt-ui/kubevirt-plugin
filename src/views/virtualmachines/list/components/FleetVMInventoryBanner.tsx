import type { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, AlertActionLink, AlertVariant } from '@patternfly/react-core';

type FleetVMInventoryBannerProps = {
  error?: Error;
  hasInventory: boolean;
  onRetry?: () => void;
};

const FleetVMInventoryBanner: FC<FleetVMInventoryBannerProps> = ({
  error,
  hasInventory,
  onRetry,
}) => {
  const { t } = useKubevirtTranslation();

  if (!error) {
    return null;
  }

  const title = hasInventory
    ? t('Showing last known virtual machines')
    : t('Error loading virtual machines');

  const body = hasInventory
    ? t('The latest inventory refresh failed. Displayed data may be out of date.')
    : error.message || t('An unknown error occurred');

  return (
    <Alert
      actionLinks={
        onRetry ? <AlertActionLink onClick={onRetry}>{t('Retry')}</AlertActionLink> : undefined
      }
      isInline
      title={title}
      variant={hasInventory ? AlertVariant.warning : AlertVariant.danger}
    >
      {body}
    </Alert>
  );
};

export default FleetVMInventoryBanner;
