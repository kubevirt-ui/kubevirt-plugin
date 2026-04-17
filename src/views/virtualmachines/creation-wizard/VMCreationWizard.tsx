import React, { FC, useEffect, useRef } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getValidNamespace } from '@kubevirt-utils/utils/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { Wizard, WizardHeader, WizardStep } from '@patternfly/react-core';
import { useSignals } from '@preact/signals-react/runtime';
import DefaultWizardFooter from '@virtualmachines/creation-wizard/components/DefaultWizardFooter';
import useCloseWizard from '@virtualmachines/creation-wizard/hooks/useCloseWizard';
import useCreateVM from '@virtualmachines/creation-wizard/hooks/useCreateVM';
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';
import CloneSourceStep from '@virtualmachines/creation-wizard/steps/CloneSourceStep/CloneSourceStep';
import CustomizationStep from '@virtualmachines/creation-wizard/steps/CustomizationStep/CustomizationStep';
import BootSourceStep from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/BootSourceStep/BootSourceStep';
import ComputeResourcesStepFooter from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/ComputeResourcesStep/components/ComputeResourcesStepFooter';
import ComputeResourcesStep from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/ComputeResourcesStep/ComputeResourcesStep';
import GuestOSStep from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/GuestOSStep/GuestOSStep';
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

const VMCreationWizard: FC = () => {
  const { t } = useKubevirtTranslation();
  useSignals();
  const { creationMethod, project, setCluster, setProject, setTemplatesDrawerIsOpen } =
    useVMWizardStore();
  const clusterParam = useClusterParam();
  const hasInitialized = useRef(false);
  const createVM = useCreateVM();
  const closeWizard = useCloseWizard();
  const [activeNamespace] = useActiveNamespace();
  const namespace = getValidNamespace(activeNamespace);

  useEffect(() => {
    if (!hasInitialized.current) {
      setCluster(clusterParam);
      setProject(project ?? namespace);
      hasInitialized.current = true;
    }
  }, [clusterParam, namespace, project, setCluster, setProject]);

  const isInstanceTypeMethod = isInstanceTypeCreationMethod(creationMethod);
  const isCloneMethod = isCloneCreationMethod(creationMethod);
  const isTemplateMethod = isTemplateCreationMethod(creationMethod);

  return (
    <TemplatesDrawerWrapper>
      <Wizard
        onStepChange={(_, currentStep) => {
          if (currentStep?.id !== VMWizardStep.TEMPLATE) setTemplatesDrawerIsOpen(false);
        }}
        className="vm-creation-wizard"
        header={<WizardHeader isCloseHidden title={t('Create VirtualMachine')} />}
        onClose={closeWizard}
        title={t('Create VirtualMachine')}
      >
        <WizardStep
          footer={<DefaultWizardFooter />}
          id={VMWizardStep.DEPLOYMENT_DETAILS}
          name={t('Deployment details')}
        >
          <DeploymentDetailsStep />
        </WizardStep>
        <WizardStep
          footer={<DefaultWizardFooter />}
          id={VMWizardStep.GUEST_OS}
          isHidden={!isInstanceTypeMethod}
          name={t('Guest OS')}
        >
          <GuestOSStep />
        </WizardStep>
        <WizardStep
          footer={<DefaultWizardFooter />}
          id={VMWizardStep.BOOT_SOURCE}
          isHidden={!isInstanceTypeMethod}
          name={t('Boot source')}
        >
          <BootSourceStep />
        </WizardStep>
        <WizardStep
          footer={<ComputeResourcesStepFooter />}
          id={VMWizardStep.COMPUTE_RESOURCES}
          isHidden={!isInstanceTypeMethod}
          name={t('Compute resources')}
        >
          <ComputeResourcesStep />
        </WizardStep>

        <WizardStep
          footer={<TemplateStepFooter />}
          id={VMWizardStep.TEMPLATE}
          isHidden={!isTemplateMethod}
          name={t('Template')}
        >
          <TemplateStep />
        </WizardStep>
        <WizardStep
          footer={<DefaultWizardFooter />}
          id={VMWizardStep.CUSTOMIZATION}
          isHidden={isCloneMethod}
          name={t('Customization')}
        >
          <CustomizationStep />
        </WizardStep>
        <WizardStep
          footer={<DefaultWizardFooter />}
          id={VMWizardStep.CLONE}
          isHidden={!isCloneMethod}
          name={t('Source')}
        >
          <CloneSourceStep />
        </WizardStep>
        <WizardStep
          footer={{
            nextButtonText: isCloneMethod ? t('Clone VirtualMachine') : t('Create VirtualMachine'),
            onNext: createVM,
          }}
          id={VMWizardStep.REVIEW_AND_CREATE}
          name={t('Review and create')}
        >
          <ReviewAndCreateStep />
        </WizardStep>
      </Wizard>
    </TemplatesDrawerWrapper>
  );
};

export default VMCreationWizard;
