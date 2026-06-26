import React, { FC, useRef } from 'react';
import { useWatch } from 'react-hook-form';

import {
  logVMCreationStarted,
  mapWizardStepToCreationMethodTelemetry,
} from '@kubevirt-utils/extensions/telemetry/vm-creation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Wizard, WizardHeader, WizardStep } from '@patternfly/react-core';
import DefaultWizardFooter from '@virtualmachines/creation-wizard-new/components/DefaultWizardFooter';
import useCloseWizard from '@virtualmachines/creation-wizard-new/hooks/useCloseWizard';
import { useSyncDeploymentDetails } from '@virtualmachines/creation-wizard-new/hooks/useSyncDeploymentDetails';
import useVMGenerationNavItem from '@virtualmachines/creation-wizard-new/hooks/useVMGenerationNavItem';
import useWizardStepValidation from '@virtualmachines/creation-wizard-new/hooks/useWizardStepValidation';
import CloneSourceStep from '@virtualmachines/creation-wizard-new/steps/CloneSourceStep/CloneSourceStep';
import CustomizationStep from '@virtualmachines/creation-wizard-new/steps/CustomizationStep/CustomizationStep';
import DeploymentDetailsStepFooter from '@virtualmachines/creation-wizard-new/steps/DeploymentDetailsStep/components/DeploymentDetailsStepFooter';
import BootSourceStep from '@virtualmachines/creation-wizard-new/steps/InstanceTypesSteps/BootSourceStep/BootSourceStep';
import ComputeResourcesStepFooter from '@virtualmachines/creation-wizard-new/steps/InstanceTypesSteps/ComputeResourcesStep/components/ComputeResourcesStepFooter';
import ComputeResourcesStep from '@virtualmachines/creation-wizard-new/steps/InstanceTypesSteps/ComputeResourcesStep/ComputeResourcesStep';
import GuestOSStep from '@virtualmachines/creation-wizard-new/steps/InstanceTypesSteps/GuestOSStep/GuestOSStep';
import ReviewAndCreateStepFooter from '@virtualmachines/creation-wizard-new/steps/ReviewAndCreateStep/components/ReviewAndCreateStepFooter';
import ReviewAndCreateStep from '@virtualmachines/creation-wizard-new/steps/ReviewAndCreateStep/ReviewAndCreateStep';
import TemplateStepFooter from '@virtualmachines/creation-wizard-new/steps/TemplateStep/components/TemplateStepFooter';
import TemplateStep from '@virtualmachines/creation-wizard-new/steps/TemplateStep/TemplateStep';
import { VMWizardStep } from '@virtualmachines/creation-wizard-new/utils/constants';
import {
  isCloneCreationMethod,
  isInstanceTypeCreationMethod,
  isTemplateCreationMethod,
} from '@virtualmachines/creation-wizard-new/utils/utils';

import TemplatesDrawerWrapper from './components/TemplatesDrawerWrapper';
import { useVMWizard } from './state/vm-wizard-context/VMWizardContext';
import {
  CREATE_VM_FORM_FIELDS_UI_STATE,
  CREATE_VM_FORM_FIELDS_VM_DATA,
} from './state/vm-wizard-form/consts';
import useVMWizardStepNavigationActions from './state/vm-wizard-form/useVMWizardStepNavigationActions';
import DeploymentDetailsStep from './steps/DeploymentDetailsStep/DeploymentDetailsStep';

import './Wizard.scss';

const VMCreationWizardContent: FC = () => {
  const { t } = useKubevirtTranslation();
  const { markStepVisited } = useVMWizardStepNavigationActions();
  const { control, setValue } = useVMWizard();
  const creationMethod = useWatch({ control, name: CREATE_VM_FORM_FIELDS_VM_DATA.CREATION_METHOD });
  const syncDeploymentDetails = useSyncDeploymentDetails();
  const { isNextDisabledForStep, isStepDisabled } = useWizardStepValidation();
  const { navItemWithVMGeneration } = useVMGenerationNavItem(creationMethod);
  const hasLoggedCreationStarted = useRef(false);
  const closeWizard = useCloseWizard();

  const isInstanceTypeMethod = isInstanceTypeCreationMethod(creationMethod);
  const isCloneMethod = isCloneCreationMethod(creationMethod);
  const isTemplateMethod = isTemplateCreationMethod(creationMethod);

  return (
    <TemplatesDrawerWrapper>
      <Wizard
        onStepChange={(_, currentStep, prevStep) => {
          syncDeploymentDetails(currentStep, prevStep);
          if (currentStep?.id !== VMWizardStep.TEMPLATE) {
            setValue(CREATE_VM_FORM_FIELDS_UI_STATE.IS_TEMPLATES_DRAWER_OPEN, false);
          }
          if (currentStep?.id) markStepVisited(String(currentStep.id));

          const creationMethodTelemetry = mapWizardStepToCreationMethodTelemetry(
            String(currentStep?.id),
          );
          if (!hasLoggedCreationStarted.current && creationMethodTelemetry) {
            hasLoggedCreationStarted.current = true;
            logVMCreationStarted(creationMethodTelemetry);
          }
        }}
        className="vm-creation-wizard"
        header={<WizardHeader isCloseHidden title={t('Create VirtualMachine')} />}
        onClose={closeWizard}
        title={t('Create VirtualMachine')}
      >
        <WizardStep
          footer={<DeploymentDetailsStepFooter />}
          id={VMWizardStep.DEPLOYMENT_DETAILS}
          name={t('Deployment details')}
        >
          <DeploymentDetailsStep />
        </WizardStep>
        <WizardStep
          footer={{
            isNextDisabled: isNextDisabledForStep(VMWizardStep.GUEST_OS),
          }}
          id={VMWizardStep.GUEST_OS}
          isDisabled={isStepDisabled(VMWizardStep.GUEST_OS)}
          isHidden={!isInstanceTypeMethod}
          name={t('Guest OS')}
        >
          <GuestOSStep />
        </WizardStep>
        <WizardStep
          footer={{
            isNextDisabled: isNextDisabledForStep(VMWizardStep.BOOT_SOURCE),
          }}
          id={VMWizardStep.BOOT_SOURCE}
          isDisabled={isStepDisabled(VMWizardStep.BOOT_SOURCE)}
          isHidden={!isInstanceTypeMethod}
          name={t('Boot source')}
        >
          <BootSourceStep />
        </WizardStep>
        <WizardStep
          footer={<ComputeResourcesStepFooter />}
          id={VMWizardStep.COMPUTE_RESOURCES}
          isDisabled={isStepDisabled(VMWizardStep.COMPUTE_RESOURCES)}
          isHidden={!isInstanceTypeMethod}
          name={t('Compute resources')}
        >
          <ComputeResourcesStep />
        </WizardStep>

        <WizardStep
          footer={<TemplateStepFooter />}
          id={VMWizardStep.TEMPLATE}
          isDisabled={isStepDisabled(VMWizardStep.TEMPLATE)}
          isHidden={!isTemplateMethod}
          name={t('Template')}
        >
          <TemplateStep />
        </WizardStep>
        <WizardStep
          footer={<DefaultWizardFooter />}
          id={VMWizardStep.CUSTOMIZATION}
          isDisabled={isStepDisabled(VMWizardStep.CUSTOMIZATION)}
          isHidden={isCloneMethod}
          name={t('Customization')}
          navItem={navItemWithVMGeneration}
        >
          <CustomizationStep />
        </WizardStep>
        <WizardStep
          footer={{
            isNextDisabled: isNextDisabledForStep(VMWizardStep.CLONE),
          }}
          id={VMWizardStep.CLONE}
          isDisabled={isStepDisabled(VMWizardStep.CLONE)}
          isHidden={!isCloneMethod}
          name={t('Source')}
        >
          <CloneSourceStep />
        </WizardStep>
        <WizardStep
          footer={<ReviewAndCreateStepFooter />}
          id={VMWizardStep.REVIEW_AND_CREATE}
          isDisabled={isStepDisabled(VMWizardStep.REVIEW_AND_CREATE)}
          name={t('Review and create')}
          navItem={navItemWithVMGeneration}
        >
          <ReviewAndCreateStep />
        </WizardStep>
      </Wizard>
    </TemplatesDrawerWrapper>
  );
};

export default VMCreationWizardContent;
