import React, { FC, useCallback, useMemo, useRef } from 'react';
import { useWatch } from 'react-hook-form';

import {
  logVMCreationStarted,
  mapWizardStepToCreationMethodTelemetry,
} from '@kubevirt-utils/extensions/telemetry/vm-creation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Wizard, WizardHeader, WizardStep, WizardStepType } from '@patternfly/react-core';
import useCloseWizard from '@virtualmachines/creation-wizard-new/hooks/useCloseWizard';
import { useSyncDeploymentDetails } from '@virtualmachines/creation-wizard-new/hooks/useSyncDeploymentDetails';
import useVMGenerationNavItem from '@virtualmachines/creation-wizard-new/hooks/useVMGenerationNavItem';
import useWizardStepValidation from '@virtualmachines/creation-wizard-new/hooks/useWizardStepValidation';
import { VMWizardStep } from '@virtualmachines/creation-wizard-new/utils/constants';

import TemplatesDrawerWrapper from './components/TemplatesDrawerWrapper';
import { useVMWizard } from './state/vm-wizard-context/VMWizardContext';
import {
  CREATE_VM_FORM_FIELDS_UI_STATE,
  CREATE_VM_FORM_FIELDS_VM_DATA,
} from './state/vm-wizard-form/consts';
import { VMWizardStepDisplay } from './utils/types';
import { markStepVisited } from './utils/utils';

import './Wizard.scss';
import {
  getCustomizationStep,
  getReviewAndCreateStep,
  getStepsToDisplayByCreationMethod,
} from './utils/displaySteps';

const VMCreationWizardContent: FC = () => {
  const { t } = useKubevirtTranslation();
  const closeWizard = useCloseWizard();

  const { isNextDisabledForStep, isStepDisabled } = useWizardStepValidation();
  const { control, getValues, setValue } = useVMWizard();
  const creationMethod = useWatch({ control, name: CREATE_VM_FORM_FIELDS_VM_DATA.CREATION_METHOD });
  const { navItemWithVMGeneration } = useVMGenerationNavItem(creationMethod);
  const syncDeploymentDetails = useSyncDeploymentDetails();
  const hasLoggedCreationStarted = useRef(false);

  const stepsToDisplay: VMWizardStepDisplay[] = useMemo(() => {
    const customizationStep = getCustomizationStep(t, navItemWithVMGeneration, isStepDisabled);
    const reviewAndCreateStep = getReviewAndCreateStep(t, navItemWithVMGeneration, isStepDisabled);
    return getStepsToDisplayByCreationMethod({
      customizationStep,
      isNextDisabledForStep,
      isStepDisabled,
      reviewAndCreateStep,
      t,
    })[creationMethod].sort((a, b) => a.displayIndex - b.displayIndex);
  }, [navItemWithVMGeneration, isStepDisabled, isNextDisabledForStep, creationMethod, t]);

  const onStepChange = useCallback(
    (currentStep: WizardStepType, prevStep: WizardStepType) => {
      syncDeploymentDetails(currentStep, prevStep);

      if (currentStep?.id !== VMWizardStep.TEMPLATE) {
        setValue(CREATE_VM_FORM_FIELDS_UI_STATE.IS_TEMPLATES_DRAWER_OPEN, false);
      }

      if (currentStep?.id) {
        markStepVisited(String(currentStep.id), getValues, setValue);
      }

      const creationMethodTelemetry = mapWizardStepToCreationMethodTelemetry(
        String(currentStep?.id),
      );

      if (!hasLoggedCreationStarted.current && creationMethodTelemetry) {
        hasLoggedCreationStarted.current = true;
        logVMCreationStarted(creationMethodTelemetry);
      }
    },
    [getValues, setValue, syncDeploymentDetails],
  );

  return (
    <TemplatesDrawerWrapper>
      <Wizard
        className="vm-creation-wizard"
        header={<WizardHeader isCloseHidden title={t('Create VirtualMachine')} />}
        onClose={closeWizard}
        onStepChange={(_, currentStep, prevStep) => onStepChange(currentStep, prevStep)}
        title={t('Create VirtualMachine')}
      >
        {stepsToDisplay?.map((step) => (
          <WizardStep
            footer={step.footer}
            id={step.id}
            isDisabled={step.isDisabled}
            key={step.id}
            name={step.name}
            navItem={step.navItem}
          >
            {step.children}
          </WizardStep>
        ))}
      </Wizard>
    </TemplatesDrawerWrapper>
  );
};

export default VMCreationWizardContent;
