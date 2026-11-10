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
    ? t('Virtual machine data might be outdated')
    : t('Error loading virtual machines');

  const body = hasInventory
    ? t("We couldn't refresh the list. Showing the last retrieved data.")
    : error.message || t('An unknown error occurred');

  return (
    <Alert
      actionLinks={
        onRetry ? (
          <AlertActionLink onClick={onRetry}>{t('Refresh data')}</AlertActionLink>
        ) : undefined
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
