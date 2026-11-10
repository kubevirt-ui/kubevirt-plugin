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

import { type BootableVolumeWizardStep } from './form/stepValidation';
import useBootableVolumeWizardNavigation from './hooks/useBootableVolumeWizardNavigation';
import { useBootableVolumeWizardState } from './hooks/useBootableVolumeWizardState';
import { getBootableVolumeWizardNavItem, getBootableVolumeWizardSteps } from './utils/steps';

import './AddBootableVolumeWizard.scss';

type AddBootableVolumeWizardContentProps = {
  onClose: () => void;
};

const AddBootableVolumeWizardContent: FC<AddBootableVolumeWizardContentProps> = ({ onClose }) => {
  const { t } = useKubevirtTranslation();
  const { setCurrentStep } = useBootableVolumeWizardState();
  const navigation = useBootableVolumeWizardNavigation({ onClose });

  const steps = useMemo(() => getBootableVolumeWizardSteps(t, navigation), [t, navigation]);

  const onStepChange = useCallback(
    (nextWizardStep: WizardStepType) => {
      if (nextWizardStep?.id) {
        setCurrentStep(nextWizardStep.id as BootableVolumeWizardStep);
      }
    },
    [setCurrentStep],
  );

  return (
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
  );
};

export default AddBootableVolumeWizardContent;
