import React, { FC } from 'react';

import ExpandSectionWithCustomToggle from '@kubevirt-utils/components/ExpandSectionWithCustomToggle/ExpandSectionWithCustomToggle';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, Skeleton, Stack, StackItem } from '@patternfly/react-core';

import {
  DESCHEDULER_OPERATOR_NAME,
  NETOBSERV_OPERATOR_NAME,
  NMSTATE_OPERATOR_NAME,
  NODE_HEALTH_OPERATOR_NAME,
} from '../utils/constants';
import {
  useVirtualizationFeaturesContext,
  VirtualizationFeaturesContextProvider,
} from '../utils/VirtualizationFeaturesContext/VirtualizationFeaturesContext';
import VirtualizationFeaturesWizard from '../VirtualizationFeaturesWizard/VirtualizationFeaturesWizard';

import FeaturedOperatorItem from './components/FeaturedOperatorItem';
import LoadBalanceSection from './components/LoadBalanceSection/LoadBalanceSection';

import './VirtualizationFeaturesSection.scss';

const VirtualizationFeaturesSection: FC = () => {
  const { t } = useKubevirtTranslation();
  const { operatorResourcesLoaded } = useVirtualizationFeaturesContext();
  const { createModal } = useModal();

  const ConfigureButton = (
    <div className="virtualization-features-section__button-container">
      {!operatorResourcesLoaded ? (
        <Skeleton className="virtualization-features-section__button-skeleton" />
      ) : (
        <Button
          onClick={() =>
            createModal((props) => (
              <VirtualizationFeaturesContextProvider>
                <VirtualizationFeaturesWizard {...props} />
              </VirtualizationFeaturesContextProvider>
            ))
          }
          isDisabled={!operatorResourcesLoaded}
        >
          {t('Configure features')}
        </Button>
      )}
    </div>
  );

  return (
    <ExpandSectionWithCustomToggle
      className="virtualization-features-section"
      customContent={ConfigureButton}
      id="virtualization-features-section"
      isIndented
      toggleContent={t('Virtualization features')}
    >
      <Stack hasGutter>
        <StackItem isFilled>
          <FeaturedOperatorItem
            operatorName={NETOBSERV_OPERATOR_NAME}
            title={t('Network observability')}
          />
        </StackItem>
        <StackItem isFilled>
          <FeaturedOperatorItem
            operatorName={NMSTATE_OPERATOR_NAME}
            title={t('Host network management (NMState)')}
          />
        </StackItem>
        <StackItem isFilled>
          <FeaturedOperatorItem
            operatorName={NODE_HEALTH_OPERATOR_NAME}
            title={t('High availability')}
          />
        </StackItem>
        <StackItem isFilled>
          <LoadBalanceSection operatorName={DESCHEDULER_OPERATOR_NAME} />
        </StackItem>
      </Stack>
    </ExpandSectionWithCustomToggle>
  );
};

export default VirtualizationFeaturesSection;
