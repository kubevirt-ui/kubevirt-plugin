import { type FC, useCallback, useMemo, useRef } from 'react';
import { useWatch } from 'react-hook-form';

import {
  logVMCreationStarted,
  mapWizardStepToCreationMethodTelemetry,
} from '@kubevirt-utils/extensions/telemetry';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Wizard, WizardHeader, WizardStep, type WizardStepType } from '@patternfly/react-core';
import {
  useVMWizardForm,
  type VMWizardFormResources,
} from '@virtualmachines/wizard/form/VMWizardFormProvider';
import useCloseWizard from '@virtualmachines/wizard/hooks/useCloseWizard';
import useVMGenerationCoordinator from '@virtualmachines/wizard/hooks/useVMGenerationCoordinator/useVMGenerationCoordinator';
import { useWizardVMDraft } from '@virtualmachines/wizard/hooks/useWizardVMDraft';
import { useVMWizardState } from '@virtualmachines/wizard/state/useVMWizardState';

import RequiredLabelsDrawerWrapper from './components/RequiredLabelsDrawerWrapper';
import TemplatesDrawerWrapper from './components/TemplatesDrawerWrapper';
import useVMGenerationNavClick from './hooks/useVMGenerationNavClick';
import { type VMCreationMethod, VMWizardStep } from './utils/constants';
import { getStepsToDisplayByCreationMethod } from './utils/displaySteps';
import { getVMGenerationNavItem } from './utils/steps';
import { type VMWizardStepDisplay } from './utils/types';
import { isCloneCreationMethod } from './utils/utils';

import './Wizard.scss';

const VMCreationWizardContent: FC<VMWizardFormResources> = ({
  autoAppliedLabels,
  autoLabelsLoading,
}) => {
  const { t } = useKubevirtTranslation();
  const closeWizard = useCloseWizard();

  const { control } = useVMWizardForm();
  const creationMethod = useWatch({
    control,
    name: 'creationMethod',
  });

  const { currentStep, setCurrentStep, setIsTemplateDrawerOpen } = useVMWizardState();

  const generationCoordinator = useVMGenerationCoordinator({ autoLabelsLoading });
  const navItemConfig = useVMGenerationNavClick(creationMethod, generationCoordinator);

  const { finalizeDraft } = useWizardVMDraft();
  const hasLoggedCreationStartedRef = useRef(false);

  const stepsToDisplay: VMWizardStepDisplay[] = useMemo(
    () =>
      getStepsToDisplayByCreationMethod({
        navItemConfig,
        t,
      })[creationMethod as VMCreationMethod].toSorted((a, b) => a.displayIndex - b.displayIndex),
    [navItemConfig, creationMethod, t],
  );

  const onStepChange = useCallback(
    (nextWizardStep: WizardStepType, prevStep: WizardStepType) => {
      if (
        !isCloneCreationMethod(creationMethod) &&
        (nextWizardStep?.id === VMWizardStep.DEPLOYMENT_DETAILS ||
          prevStep?.id === VMWizardStep.DEPLOYMENT_DETAILS)
      ) {
        finalizeDraft();
      }
      if (nextWizardStep?.id !== VMWizardStep.TEMPLATE) {
        setIsTemplateDrawerOpen(false);
      }

      if (nextWizardStep?.id) {
        const nextStep = nextWizardStep.id as VMWizardStep;
        setCurrentStep(nextStep);
      }

      const creationMethodTelemetry = mapWizardStepToCreationMethodTelemetry(
        String(nextWizardStep?.id),
      );

      if (!hasLoggedCreationStartedRef.current && creationMethodTelemetry) {
        hasLoggedCreationStartedRef.current = true;
        logVMCreationStarted(creationMethodTelemetry);
      }
    },
    [creationMethod, finalizeDraft, setCurrentStep, setIsTemplateDrawerOpen],
  );

  return (
    <RequiredLabelsDrawerWrapper
      autoAppliedLabels={autoAppliedLabels}
      currentStep={currentStep as VMWizardStep}
    >
      <TemplatesDrawerWrapper>
        <Wizard
          className="vm-creation-wizard"
          header={<WizardHeader isCloseHidden title={t('Create VirtualMachine')} />}
          onClose={closeWizard}
          onStepChange={(_event, nextWizardStep, prevStep) =>
            onStepChange(nextWizardStep, prevStep)
          }
          title={t('Create VirtualMachine')}
        >
          {stepsToDisplay?.map(({ children, footer, id, name }) => (
            <WizardStep
              footer={footer}
              id={id}
              isDisabled={Boolean(navItemConfig.isStepDisabled(id as VMWizardStep))}
              key={id}
              name={name}
              navItem={getVMGenerationNavItem(navItemConfig)}
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
