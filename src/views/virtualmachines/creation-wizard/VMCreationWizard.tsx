import React, { FC, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom-v5-compat';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useClusterParam from '@multicluster/hooks/useClusterParam';
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
import {
  isCloneCreationMethod,
  isInstanceTypeCreationMethod,
  isTemplateCreationMethod,
} from '@virtualmachines/creation-wizard/utils/utils';

import DeploymentDetailsStep from './steps/DeploymentDetailsStep/DeploymentDetailsStep';

const VMCreationWizard: FC = () => {
  const { t } = useKubevirtTranslation();
  useSignals();
  const { creationMethod, setCluster, setProject } = useVMWizardStore();
  const clusterParam = useClusterParam();
  const { ns } = useParams<{ ns: string }>();
  const hasInitialized = useRef(false);
  const createVM = useCreateVM();
  const closeWizard = useCloseWizard();

  useEffect(() => {
    if (!hasInitialized.current) {
      setCluster(clusterParam);
      setProject(ns);
      hasInitialized.current = true;
    }
  }, [clusterParam, ns, setCluster, setProject]);

  const isInstanceTypeMethod = isInstanceTypeCreationMethod(creationMethod);
  const isCloneMethod = isCloneCreationMethod(creationMethod);
  const isTemplateMethod = isTemplateCreationMethod(creationMethod);

  return (
    <Wizard
      className="vm-creation-wizard"
      header={<WizardHeader isCloseHidden title={t('Create VirtualMachine')} />}
      onClose={closeWizard}
      title={t('Create VirtualMachine')}
    >
      <WizardStep
        footer={<DefaultWizardFooter />}
        id="vm-creation-deployment-details-step"
        name={t('Deployment details')}
      >
        <DeploymentDetailsStep />
      </WizardStep>
      <WizardStep
        footer={<DefaultWizardFooter />}
        id="vm-creation-guest-os-step"
        isHidden={!isInstanceTypeMethod}
        name={t('Guest OS')}
      >
        <GuestOSStep />
      </WizardStep>
      <WizardStep
        footer={<DefaultWizardFooter />}
        id="vm-creation-boot-source-step"
        isHidden={!isInstanceTypeMethod}
        name={t('Boot source')}
      >
        <BootSourceStep />
      </WizardStep>
      <WizardStep
        footer={<ComputeResourcesStepFooter />}
        id="vm-creation-compute-resources-step"
        isHidden={!isInstanceTypeMethod}
        name={t('Compute resources')}
      >
        <ComputeResourcesStep />
      </WizardStep>

      <WizardStep
        footer={<TemplateStepFooter />}
        id="vm-creation-template-step"
        isHidden={!isTemplateMethod}
        name={t('Template')}
      >
        <TemplateStep />
      </WizardStep>
      <WizardStep
        footer={<DefaultWizardFooter />}
        id="vm-creation-customization-step"
        isHidden={isCloneMethod}
        name={t('Customization')}
      >
        <CustomizationStep />
      </WizardStep>
      <WizardStep
        footer={<DefaultWizardFooter />}
        id="vm-creation-clone-step"
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
        id="vm-creation-review-and-create-step"
        name={t('Review and create')}
      >
        <ReviewAndCreateStep />
      </WizardStep>
    </Wizard>
  );
};

export default VMCreationWizard;
