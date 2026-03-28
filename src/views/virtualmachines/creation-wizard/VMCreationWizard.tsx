import React, { FC, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom-v5-compat';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { getVMListURL } from '@multicluster/urls';
import { Wizard, WizardHeader, WizardStep } from '@patternfly/react-core';
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';
import BootSourceStep from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/BootSourceStep/BootSourceStep';
import ComputeResourcesStep from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/ComputeResourcesStep/ComputeResourcesStep';
import GuestOSStep from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/GuestOSStep/GuestOSStep';
import { VMCreationMethod } from '@virtualmachines/creation-wizard/utils/constants';
import { getWizardFooterProps } from '@virtualmachines/creation-wizard/utils/utils';

import DeploymentDetailsStep from './steps/DeploymentDetailsStep/DeploymentDetailsStep';

const VMCreationWizard: FC = () => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const { creationMethod, resetWizardState, setCluster, setProject } = useVMWizardStore();
  const clusterParam = useClusterParam();
  const { ns } = useParams<{ ns: string }>();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current) {
      setCluster(clusterParam);
      setProject(ns);
      hasInitialized.current = true;
    }
  }, [clusterParam, ns, setCluster, setProject]);

  const wizardFooterProps = getWizardFooterProps(t);

  const isInstanceTypeMethod = creationMethod === VMCreationMethod.INSTANCE_TYPE;

  const vmListURL = getVMListURL(clusterParam, ns);

  const handleClose = useCallback(() => {
    resetWizardState();
    navigate(vmListURL);
  }, [resetWizardState, vmListURL, navigate]);

  return (
    <Wizard
      className="vm-creation-wizard"
      header={<WizardHeader title={t('Create VirtualMachine')} />}
      onClose={handleClose}
      title={t('Create VirtualMachine')}
    >
      <WizardStep
        footer={wizardFooterProps}
        id="vm-creation-deployment-details-step"
        name={t('Deployment details')}
      >
        <DeploymentDetailsStep />
      </WizardStep>
      <WizardStep
        footer={wizardFooterProps}
        id="vm-creation-guest-os-step"
        isHidden={!isInstanceTypeMethod}
        name={t('Guest OS')}
      >
        <GuestOSStep />
      </WizardStep>
      <WizardStep
        footer={wizardFooterProps}
        id="vm-creation-boot-source-step"
        isHidden={!isInstanceTypeMethod}
        name={t('Boot source')}
      >
        <BootSourceStep />
      </WizardStep>
      <WizardStep
        footer={wizardFooterProps}
        id="vm-creation-compute-resources-step"
        isHidden={!isInstanceTypeMethod}
        name={t('Compute resources')}
      >
        <ComputeResourcesStep />
      </WizardStep>
    </Wizard>
  );
};

export default VMCreationWizard;
