import { type FC } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, AlertActionLink } from '@patternfly/react-core';

import { getVirtIORecommendations, type VirtIORecommendationKind } from './virtioUtils';

type VirtIORecommendationAlertProps = {
  kind: VirtIORecommendationKind;
  onSwitchToVirtio: (updatedVM: V1VirtualMachine) => void;
  vm: V1VirtualMachine;
};

const VirtIORecommendationAlert: FC<VirtIORecommendationAlertProps> = ({
  kind,
  onSwitchToVirtio,
  vm,
}) => {
  const { t } = useKubevirtTranslation();

  const recommendation = getVirtIORecommendations(t, vm)[kind];

  if (!recommendation.shouldShow) {
    return null;
  }

  return (
    <Alert
      actionLinks={
        <>
          <AlertActionLink onClick={() => onSwitchToVirtio(recommendation.switchToVirtio(vm))}>
            {t('Switch all to VirtIO')}
          </AlertActionLink>
          <ExternalLink
            ariaLabel={t('Learn more about VirtIO drivers (opens in a new tab)')}
            href={documentationURL.VIRTIO_WIN_DRIVERS}
            text={t('Learn more')}
          />
        </>
      }
      className="pf-v6-u-mb-md"
      component="h3"
      isInline
      isLiveRegion
      title={recommendation.title}
      variant="info"
    >
      {recommendation.description}
    </Alert>
  );
};

export default VirtIORecommendationAlert;
