import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import ConfigurationStepContent from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/ConfigurationStep/ConfigurationStepContent';
import SummaryStepContent from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/SummaryStep/SummaryStepContent';
import { Modal, ModalVariant, Wizard, WizardHeader, WizardStep } from '@patternfly/react-core';

import './VirtualizationFeaturesWizard.scss';

type VirtualizationFeaturesWizardProps = {
  isOpen: boolean;
  onClose: () => void;
};

const VirtualizationFeaturesWizard: FC<VirtualizationFeaturesWizardProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useKubevirtTranslation();

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
          name={t('Summary')}
        >
          <SummaryStepContent />
        </WizardStep>
      </Wizard>
    </Modal>
  );
};

export default VirtualizationFeaturesWizard;
