import React, { FC, useEffect, useRef } from 'react';

import {
  logVMCreationStarted,
  mapWizardStepToCreationMethodTelemetry,
} from '@kubevirt-utils/extensions/telemetry/vm-creation';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getValidNamespace } from '@kubevirt-utils/utils/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { Wizard, WizardHeader, WizardStep } from '@patternfly/react-core';
import DefaultWizardFooter from '@virtualmachines/creation-wizard/components/DefaultWizardFooter';
import useCloseWizard from '@virtualmachines/creation-wizard/hooks/useCloseWizard';
import useSyncDescription from '@virtualmachines/creation-wizard/hooks/useSyncDescription';
import useVMGenerationNavItem from '@virtualmachines/creation-wizard/hooks/useVMGenerationNavItem';
import useWizardStepValidation from '@virtualmachines/creation-wizard/hooks/useWizardStepValidation';
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';
import CloneSourceStep from '@virtualmachines/creation-wizard/steps/CloneSourceStep/CloneSourceStep';
import CustomizationStep from '@virtualmachines/creation-wizard/steps/CustomizationStep/CustomizationStep';
import DeploymentDetailsStepFooter from '@virtualmachines/creation-wizard/steps/DeploymentDetailsStep/components/DeploymentDetailsStepFooter';
import BootSourceStep from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/BootSourceStep/BootSourceStep';
import ComputeResourcesStepFooter from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/ComputeResourcesStep/components/ComputeResourcesStepFooter';
import ComputeResourcesStep from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/ComputeResourcesStep/ComputeResourcesStep';
import GuestOSStep from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/GuestOSStep/GuestOSStep';
import ReviewAndCreateStepFooter from '@virtualmachines/creation-wizard/steps/ReviewAndCreateStep/components/ReviewAndCreateStepFooter';
import ReviewAndCreateStep from '@virtualmachines/creation-wizard/steps/ReviewAndCreateStep/ReviewAndCreateStep';
import TemplateStepFooter from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplateStepFooter';
import TemplateStep from '@virtualmachines/creation-wizard/steps/TemplateStep/TemplateStep';
import { VMWizardStep } from '@virtualmachines/creation-wizard/utils/constants';
import {
  isCloneCreationMethod,
  isInstanceTypeCreationMethod,
  isTemplateCreationMethod,
} from '@virtualmachines/creation-wizard/utils/utils';

import TemplatesDrawerWrapper from './components/TemplatesDrawerWrapper';
import DeploymentDetailsStep from './steps/DeploymentDetailsStep/DeploymentDetailsStep';

import './Wizard.scss';

const VMCreationWizard: FC = () => {
  const { t } = useKubevirtTranslation();
  const {
    creationMethod,
    markStepVisited,
    project,
    resetWizardState,
    setCluster,
    setProject,
    setTemplatesDrawerIsOpen,
  } = useVMWizardStore();
  const syncDescription = useSyncDescription();
  const { isNextDisabledForStep, isStepDisabled } = useWizardStepValidation();
  const { navItemWithVMGeneration } = useVMGenerationNavItem(creationMethod);
  const clusterParam = useClusterParam();
  const hasInitialized = useRef(false);
  const hasLoggedCreationStarted = useRef(false);
  const closeWizard = useCloseWizard();
  const isAdmin = useIsAdmin();
  const [activeNamespace] = useActiveNamespace();
  const namespace = getValidNamespace(activeNamespace);

  useEffect(() => {
    if (!hasInitialized.current) {
      const currentProject = project; // capture before resetWizardState clears it
      resetWizardState();
      setTemplatesDrawerIsOpen(false);

      setCluster(clusterParam);
      // Non-admin: always use the active namespace.
      // Admin: keep their previously selected project if set, otherwise use the active namespace.
      setProject(!isAdmin ? namespace : currentProject || namespace);
      hasInitialized.current = true;
    }
  }, [
    clusterParam,
    isAdmin,
    namespace,
    project,
    resetWizardState,
    setCluster,
    setProject,
    setTemplatesDrawerIsOpen,
  ]);

  const isInstanceTypeMethod = isInstanceTypeCreationMethod(creationMethod);
  const isCloneMethod = isCloneCreationMethod(creationMethod);
  const isTemplateMethod = isTemplateCreationMethod(creationMethod);

  return (
    <TemplatesDrawerWrapper>
      <Wizard
        onStepChange={(_, currentStep, prevStep) => {
          syncDescription(currentStep, prevStep);
          if (currentStep?.id !== VMWizardStep.TEMPLATE) setTemplatesDrawerIsOpen(false);
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

export default VMCreationWizard;
