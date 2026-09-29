import { type FC, useCallback, useMemo, useRef } from 'react';
import { useWatch } from 'react-hook-form';

import {
  logVMCreationStarted,
  mapWizardStepToCreationMethodTelemetry,
} from '@kubevirt-utils/extensions/telemetry';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Wizard, WizardHeader, WizardStep, type WizardStepType } from '@patternfly/react-core';
import useCloseWizard from '@virtualmachines/wizard/hooks/useCloseWizard';
import { useSyncDeploymentDetailsAndMetadataFields } from '@virtualmachines/wizard/hooks/useSyncDeploymentDetailsAndMetadataFields';
import useWizardStepValidation from '@virtualmachines/wizard/hooks/useWizardStepValidation';

import RequiredLabelsDrawerWrapper from './components/RequiredLabelsDrawerWrapper';
import TemplatesDrawerWrapper from './components/TemplatesDrawerWrapper';
import useVMGenerationNavClick from './hooks/useVMGenerationNavClick';
import { useVMWizard } from './state/vm-wizard-context/VMWizardContext';
import { type VMCreationMethod, VMWizardStep } from './utils/constants';
import { getStepsToDisplayByCreationMethod } from './utils/displaySteps';
import { type VMWizardStepDisplay } from './utils/types';
import { markStepVisited } from './utils/utils';

import './Wizard.scss';

const VMCreationWizardContent: FC = () => {
  const { t } = useKubevirtTranslation();
  const closeWizard = useCloseWizard();

  const { isNextDisabledForStep, isStepDisabled } = useWizardStepValidation();
  const { control, getValues, setValue } = useVMWizard();
  const creationMethod = useWatch({ control, name: 'creationMethod' });
  const navItemConfig = useVMGenerationNavClick(creationMethod);
  const { syncOnDeploymentDetailsStepChange } = useSyncDeploymentDetailsAndMetadataFields();
  const hasLoggedCreationStartedRef = useRef(false);

  const stepsToDisplay: VMWizardStepDisplay[] = useMemo(
    () =>
      getStepsToDisplayByCreationMethod({
        isNextDisabledForStep,
        isStepDisabled,
        navItemConfig,
        t,
      })[creationMethod as VMCreationMethod].toSorted((a, b) => a.displayIndex - b.displayIndex),
    [navItemConfig, isStepDisabled, isNextDisabledForStep, creationMethod, t],
  );

  const onStepChange = useCallback(
    (currentStep: WizardStepType, prevStep: WizardStepType) => {
      syncOnDeploymentDetailsStepChange(currentStep, prevStep);
      if (currentStep?.id !== VMWizardStep.TEMPLATE) {
        setValue('template.isDrawerOpen', false);
      }

      if (currentStep?.id) {
        setValue('navigation.currentStep', String(currentStep.id));
        markStepVisited(String(currentStep.id), getValues, setValue);
      }

      const creationMethodTelemetry = mapWizardStepToCreationMethodTelemetry(
        String(currentStep?.id),
      );

      if (!hasLoggedCreationStartedRef.current && creationMethodTelemetry) {
        hasLoggedCreationStartedRef.current = true;
        logVMCreationStarted(creationMethodTelemetry);
      }
    },
    [getValues, setValue, syncOnDeploymentDetailsStepChange],
  );

  return (
    <RequiredLabelsDrawerWrapper>
      <TemplatesDrawerWrapper>
        <Wizard
          className="vm-creation-wizard"
          header={<WizardHeader isCloseHidden title={t('Create VirtualMachine')} />}
          onClose={closeWizard}
          onStepChange={(_event, currentStep, prevStep) => onStepChange(currentStep, prevStep)}
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
    </RequiredLabelsDrawerWrapper>
  );
};

export default VMCreationWizardContent;
