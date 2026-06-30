import React, { FC, useCallback, useMemo, useRef } from 'react';
import { useWatch } from 'react-hook-form';

import {
  logVMCreationStarted,
  mapWizardStepToCreationMethodTelemetry,
} from '@kubevirt-utils/extensions/telemetry';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Wizard, WizardHeader, WizardStep, WizardStepType } from '@patternfly/react-core';
import useCloseWizard from '@virtualmachines/creation-wizard-new/hooks/useCloseWizard';
import { useSyncDeploymentDetails } from '@virtualmachines/creation-wizard-new/hooks/useSyncDeploymentDetails';
import useWizardStepValidation from '@virtualmachines/creation-wizard-new/hooks/useWizardStepValidation';

import TemplatesDrawerWrapper from './components/TemplatesDrawerWrapper';
import useVMGenerationNavClick from './hooks/useVMGenerationNavClick';
import { useVMWizard } from './state/vm-wizard-context/VMWizardContext';
import {
  CREATE_VM_FORM_FIELDS_UI_STATE,
  CREATE_VM_FORM_FIELDS_VM_DATA,
} from './state/vm-wizard-form/consts';
import { VMWizardStep } from './utils/constants';
import { getStepsToDisplayByCreationMethod } from './utils/displaySteps';
import { VMWizardStepDisplay } from './utils/types';
import { markStepVisited } from './utils/utils';

import './Wizard.scss';

const VMCreationWizardContent: FC = () => {
  const { t } = useKubevirtTranslation();
  const closeWizard = useCloseWizard();

  const { isNextDisabledForStep, isStepDisabled } = useWizardStepValidation();
  const { control, getValues, setValue } = useVMWizard();
  const creationMethod = useWatch({ control, name: CREATE_VM_FORM_FIELDS_VM_DATA.CREATION_METHOD });
  const navItemConfig = useVMGenerationNavClick(creationMethod);
  const syncDeploymentDetails = useSyncDeploymentDetails();
  const hasLoggedCreationStarted = useRef(false);

  const stepsToDisplay: VMWizardStepDisplay[] = useMemo(
    () =>
      getStepsToDisplayByCreationMethod({
        isNextDisabledForStep,
        isStepDisabled,
        navItemConfig,
        t,
      })[creationMethod].sort((a, b) => a.displayIndex - b.displayIndex),
    [navItemConfig, isStepDisabled, isNextDisabledForStep, creationMethod, t],
  );

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
        {stepsToDisplay?.map(({ children, footer, id, isDisabled, name, navItem }) => (
          <WizardStep
            footer={footer}
            id={id}
            isDisabled={isDisabled}
            key={id}
            name={name}
            navItem={navItem}
          >
            {children}
          </WizardStep>
        ))}
      </Wizard>
    </TemplatesDrawerWrapper>
  );
};

export default VMCreationWizardContent;
