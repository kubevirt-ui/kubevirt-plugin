import React, { FC } from 'react';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, AlertActionLink } from '@patternfly/react-core';

type VirtIORecommendationAlertProps = {
  description: string;
  onSwitchToVirtio: () => void;
  title: string;
};

const VirtIORecommendationAlert: FC<VirtIORecommendationAlertProps> = ({
  description,
  onSwitchToVirtio,
  title,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <Alert
      actionLinks={
        <>
          <AlertActionLink onClick={onSwitchToVirtio}>{t('Switch all to VirtIO')}</AlertActionLink>
          <ExternalLink href={documentationURL.VIRTIO_WIN_DRIVERS} text={t('Learn more')} />
        </>
      }
      isInline
      title={title}
      variant="info"
    >
      {description}
    </Alert>
  );
};

export default VirtIORecommendationAlert;
