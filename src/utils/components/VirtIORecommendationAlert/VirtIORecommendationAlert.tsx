import React, { type FC } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { patchCustomizeWizardVMSignal } from '@kubevirt-utils/signals/customizeWizardVMSignal';
import { Alert, AlertActionLink } from '@patternfly/react-core';

import {
  hasNonVirtioDisk,
  hasNonVirtioInterface,
  switchDisksToVirtio,
  switchInterfacesToVirtio,
} from './virtioUtils';

type VirtIORecommendationKind = 'disk' | 'network';

type VirtIORecommendationAlertProps = {
  kind: VirtIORecommendationKind;
  vm: V1VirtualMachine;
};

const VirtIORecommendationAlert: FC<VirtIORecommendationAlertProps> = ({ kind, vm }) => {
  const { t } = useKubevirtTranslation();

  const recommendations = {
    disk: {
      description: t(
        'VirtIO provides the best performance. Switch disk interfaces to VirtIO unless guest drivers are unavailable.',
      ),
      shouldShow: hasNonVirtioDisk(vm),
      switchToVirtio: switchDisksToVirtio,
      title: t('Non-VirtIO disk interfaces detected'),
    },
    network: {
      description: t(
        'VirtIO provides the best performance. Switch network interfaces to VirtIO unless guest drivers are unavailable.',
      ),
      shouldShow: hasNonVirtioInterface(vm),
      switchToVirtio: switchInterfacesToVirtio,
      title: t('Non-VirtIO network interfaces detected'),
    },
  };
  const recommendation = recommendations[kind];

  if (!recommendation.shouldShow) {
    return null;
  }

  return (
    <Alert
      actionLinks={
        <>
          <AlertActionLink
            onClick={() => patchCustomizeWizardVMSignal(recommendation.switchToVirtio(vm))}
          >
            {t('Switch all to VirtIO')}
          </AlertActionLink>
          <ExternalLink
            ariaLabel={t('Learn more about VirtIO drivers (opens in a new tab)')}
            href={documentationURL.VIRTIO_WIN_DRIVERS}
            text={t('Learn more')}
          />
        </>
      }
      component="h3"
      isInline
      isLiveRegion
      style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
      title={recommendation.title}
      variant="info"
    >
      {recommendation.description}
    </Alert>
  );
};

export default VirtIORecommendationAlert;
