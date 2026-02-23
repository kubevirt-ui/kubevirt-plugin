import React, { FC, useCallback, useEffect, useRef } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Modal, ModalVariant, Wizard, WizardHeader, WizardStep } from '@patternfly/react-core';
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';

import DeploymentDetailsStep from './steps/DeploymentDetailsStep/DeploymentDetailsStep';

type VMCreationWizardProps = {
  cluster: string;
  isOpen: boolean;
  namespace: string;
  onClose: () => void;
};

const VMCreationWizard: FC<VMCreationWizardProps> = ({ cluster, isOpen, namespace, onClose }) => {
  const { t } = useKubevirtTranslation();
  const { resetWizardState, setCluster, setProject } = useVMWizardStore();
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      resetWizardState();
    }
    if (isOpen) {
      setCluster(cluster);
      setProject(namespace);
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, cluster, namespace, resetWizardState, setCluster, setProject]);

  const wizardFooterProps = {
    backButtonText: t('Back'),
    cancelButtonText: t('Cancel'),
    nextButtonText: t('Next'),
  };

  const handleClose = useCallback(() => {
    resetWizardState();
    onClose();
  }, [resetWizardState, onClose]);

  return (
    <Modal isOpen={isOpen} variant={ModalVariant.large} width="1500px">
      <Wizard
        className="vm-creation-wizard"
        header={<WizardHeader onClose={handleClose} title={t('Create VirtualMachine')} />}
        height="56.25rem" // 900px
        onClose={handleClose}
        title={t('Create VirtualMachine')}
      >
        <WizardStep
          footer={wizardFooterProps}
          id="vm-creation-deployment-details-step"
          name={t('Deployment details')}
        >
          <DeploymentDetailsStep />
        </WizardStep>
      </Wizard>
    </Modal>
  );
};

export default VMCreationWizard;
