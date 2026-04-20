import React, { FCC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Modal, ModalVariant, Wizard, WizardHeader, WizardStep } from '@patternfly/react-core';
import { useVirtualizationFeaturesContext } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/VirtualizationFeaturesContext/VirtualizationFeaturesContext';
import ConfigurationStepContent from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/ConfigurationStep/ConfigurationStepContent';
import SummaryStepContent from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/SummaryStep/SummaryStepContent';

import './VirtualizationFeaturesWizard.scss';

type VirtualizationFeaturesWizardProps = {
  isOpen: boolean;
  onClose: () => void;
};

const VirtualizationFeaturesWizard: FCC<VirtualizationFeaturesWizardProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useKubevirtTranslation();
  const { operatorResourcesLoaded } = useVirtualizationFeaturesContext();

  const wizardFooterProps = {
    backButtonText: t('Back'),
    cancelButtonText: t('Cancel'),
    nextButtonText: t('Next'),
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} variant={ModalVariant.large}>
      <Wizard
        header={
          <WizardHeader
            description={t(
              'Check your cluster readiness to run Virtualization workloads and verify it meets the system requirements needed to run VirtualMachines.',
            )}
            onClose={onClose}
            title={t('Virtualization features')}
          />
        }
        className="virtualization-features-configuration-wizard"
        height="900px"
        onClose={onClose}
        title={t('Virtualization features')}
      >
        <WizardStep
          footer={wizardFooterProps}
          id="virtualization-features-configuration-step"
          name={t('Configuration')}
        >
          <ConfigurationStepContent />
        </WizardStep>
        <WizardStep
          footer={{
            ...wizardFooterProps,
            nextButtonText: t('Finish'),
          }}
          id="virtualization-features-summary-step"
          isDisabled={!operatorResourcesLoaded}
          name={t('Summary')}
        >
          <SummaryStepContent />
        </WizardStep>
      </Wizard>
    </Modal>
  );
};

export default VirtualizationFeaturesWizard;
