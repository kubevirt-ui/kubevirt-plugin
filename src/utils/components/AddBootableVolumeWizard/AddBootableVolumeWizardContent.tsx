import { type FC, useCallback, useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Modal,
  ModalBody,
  Wizard,
  WizardHeader,
  WizardStep,
  type WizardStepType,
} from '@patternfly/react-core';
import ExitWizardModal from '@virtualmachines/wizard/components/ExitWizardModal';

import { type BootableVolumeWizardStep } from './form/stepValidation';
import useBootableVolumeWizardNavigation from './hooks/useBootableVolumeWizardNavigation';
import { useBootableVolumeWizardState } from './hooks/useBootableVolumeWizardState';
import { getBootableVolumeWizardNavItem, getBootableVolumeWizardSteps } from './utils/steps';
import type { BootableVolumeWizardCallbacks } from './utils/types';

import './AddBootableVolumeWizard.scss';

type AddBootableVolumeWizardContentProps = BootableVolumeWizardCallbacks & {
  onClose: () => void;
};

const AddBootableVolumeWizardContent: FC<AddBootableVolumeWizardContentProps> = ({
  onClose,
  onCreateVolume,
  onUploadStart,
}) => {
  const { t } = useKubevirtTranslation();
  const { setCurrentStep } = useBootableVolumeWizardState();
  const navigation = useBootableVolumeWizardNavigation({ onClose });

  const steps = useMemo(
    () => getBootableVolumeWizardSteps(t, navigation, { onCreateVolume, onUploadStart }),
    [navigation, onCreateVolume, onUploadStart, t],
  );

  const onStepChange = useCallback(
    (nextWizardStep: WizardStepType) => {
      if (nextWizardStep?.id) {
        setCurrentStep(nextWizardStep.id as BootableVolumeWizardStep);
      }
    },
    [setCurrentStep],
  );

  return (
    <>
      <Modal className="add-bootable-volume-wizard" isOpen variant="large">
        <ModalBody>
          <Wizard
            header={
              <WizardHeader onClose={navigation.handleClose} title={t('Add bootable volume')} />
            }
            onStepChange={(_event, nextWizardStep) => onStepChange(nextWizardStep)}
          >
            {steps.map(({ children, footer, id, name }) => (
              <WizardStep
                footer={footer}
                id={id}
                isDisabled={navigation.isStepDisabled(id as BootableVolumeWizardStep)}
                key={id}
                name={name}
                navItem={getBootableVolumeWizardNavItem(navigation)}
              >
                {children}
              </WizardStep>
            ))}
          </Wizard>
        </ModalBody>
      </Modal>
      <ExitWizardModal
        className="add-bootable-volume-wizard-exit"
        continueButtonText={t('Continue adding')}
        isOpen={navigation.isExitConfirmOpen}
        onClose={navigation.onContinueAdding}
        onExit={navigation.onExitWithoutSaving}
        title={t('Exit "Add bootable volume"?')}
      />
    </>
  );
};

export default AddBootableVolumeWizardContent;
