import React, { FC } from 'react';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, Skeleton } from '@patternfly/react-core';
import {
  SettingsClusterProvider,
  useIsSpokeCluster,
  useSettingsCluster,
} from '@settings/context/SettingsClusterContext';

import {
  useVirtualizationFeaturesContext,
  VirtualizationFeaturesWizardProvider,
} from '../../../utils/VirtualizationFeaturesContext/VirtualizationFeaturesContext';
import VirtualizationFeaturesWizard from '../../../VirtualizationFeaturesWizard/VirtualizationFeaturesWizard';

type ConfigureButtonProps = {
  spokeConsoleURL: string | undefined;
};

const ConfigureButton: FC<ConfigureButtonProps> = ({ spokeConsoleURL }) => {
  const { t } = useKubevirtTranslation();
  const cluster = useSettingsCluster();
  const isSpokeCluster = useIsSpokeCluster();
  const currentContext = useVirtualizationFeaturesContext();
  const { operatorResourcesLoaded } = currentContext;
  const { createModal } = useModal();

  return (
    <div className="virtualization-features-section__button-container">
      {isSpokeCluster && spokeConsoleURL && (
        <ExternalLink
          className="virtualization-features-section__catalog-link"
          href={`${spokeConsoleURL}/operatorhub`}
        >
          {t('Install features from the Software Catalog')}
        </ExternalLink>
      )}
      {!operatorResourcesLoaded ? (
        <Skeleton className="virtualization-features-section__button-skeleton" />
      ) : (
        <Button
          onClick={() => {
            const preloadedResources = currentContext;
            createModal((props) => (
              <SettingsClusterProvider cluster={cluster}>
                <VirtualizationFeaturesWizardProvider preloadedResources={preloadedResources}>
                  <VirtualizationFeaturesWizard {...props} />
                </VirtualizationFeaturesWizardProvider>
              </SettingsClusterProvider>
            ));
          }}
          isDisabled={!operatorResourcesLoaded}
          variant="secondary"
        >
          {t('Configure features')}
        </Button>
      )}
    </div>
  );
};

export default ConfigureButton;
