import React, { FC, useEffect, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom-v5-compat';

import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import { MAX_MTU } from '@kubevirt-utils/constants/constants';
import {
  logCreationFailed,
  logEventWithName,
} from '@kubevirt-utils/extensions/telemetry/telemetry';
import {
  VM_NETWORK_ABANDONED,
  VM_NETWORK_CREATION_FAILED,
  VM_NETWORK_CREATION_STARTED,
} from '@kubevirt-utils/extensions/telemetry/utils/constants';
import { logVMNetworkCreated } from '@kubevirt-utils/extensions/telemetry/vm-networks';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useQuery from '@kubevirt-utils/hooks/useQuery';
import { ClusterUserDefinedNetworkModel } from '@kubevirt-utils/models';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';
import {
  Alert,
  Button,
  ButtonVariant,
  Form,
  FormGroup,
  ValidatedOptions,
  Wizard,
  WizardStep,
} from '@patternfly/react-core';

import { VM_NETWORKS_PATH } from '../constants';
import { isValidProjectMapping } from '../utils';

import NetworkDefinition from './components/NetworkDefinition';
import ProjectMapping from './components/ProjectMapping';
import VMNetworkWizardHeader from './components/VMNetworkWizardHeader';
import { getVLANIDValidatedOption } from './utils/utils';
import { getDefaultFormValue, NODE_NETWORK_MAPPING_PARAM_KEY, VMNetworkForm } from './constants';

const VMNetworkNewForm: FC = () => {
  const navigate = useNavigate();
  const { t } = useKubevirtTranslation();
  const [apiError, setError] = useState<Error>(null);

  const params = useQuery();
  const nodeNetworkMapping = params.get(NODE_NETWORK_MAPPING_PARAM_KEY) ?? '';

  const completed = useRef(false);
  const currentStepId = useRef<number | string>('wizard-network-definition');

  useEffect(() => {
    logEventWithName(VM_NETWORK_CREATION_STARTED);
  }, []);

  useEffect(() => {
    return () => {
      if (!completed.current) {
        logEventWithName(VM_NETWORK_ABANDONED, { stepId: currentStepId.current });
      }
    };
  }, []);

  const methods = useForm<VMNetworkForm>({
    defaultValues: getDefaultFormValue(nodeNetworkMapping),
  });

  const {
    formState: { isSubmitSuccessful, isSubmitting },
    handleSubmit,
    watch,
  } = methods;

  const name = watch('network.metadata.name');
  const bridgeMapping = watch('network.spec.network.localnet.physicalNetworkName');
  const mtu = watch('network.spec.network.localnet.mtu');
  const vlan = watch('network.spec.network.localnet.vlan');
  const namespaceSelector = watch('network.spec.namespaceSelector');
  const projectMappingOption = watch('projectMappingOption');

  const isVLANInvalid =
    vlan?.mode &&
    (isEmpty(vlan.access?.id) ||
      getVLANIDValidatedOption(vlan?.access?.id) !== ValidatedOptions.default);
  const isRequiredFieldsInvalid =
    isEmpty(name) || isEmpty(bridgeMapping) || isEmpty(mtu) || mtu > MAX_MTU || isVLANInvalid;

  const isProjectMappingInvalid = !isValidProjectMapping(projectMappingOption, namespaceSelector);

  const onSubmit = async (data: VMNetworkForm) => {
    try {
      await k8sCreate({
        data: data.network,
        model: ClusterUserDefinedNetworkModel,
      });

      completed.current = true;
      logVMNetworkCreated(data.network, data.projectMappingOption);
    } catch (error) {
      completed.current = true;
      logCreationFailed(VM_NETWORK_CREATION_FAILED, error);
      setError(error);
    }
  };

  const onClose = () => navigate(VM_NETWORKS_PATH);

  return (
    <FormProvider {...methods}>
      <Wizard
        onStepChange={(_, currentStep) => {
          currentStepId.current = currentStep.id;
        }}
        header={<VMNetworkWizardHeader />}
        onSave={handleSubmit(onSubmit)}
      >
        <WizardStep
          footer={{
            isNextDisabled: isRequiredFieldsInvalid,
            onClose,
          }}
          id="wizard-network-definition"
          name={t('Network definition')}
        >
          <NetworkDefinition />
        </WizardStep>
        <WizardStep
          footer={{
            isNextDisabled: isRequiredFieldsInvalid || isSubmitting || isProjectMappingInvalid,
            nextButtonProps: { isLoading: isSubmitting },
            nextButtonText: t('Create'),
            onClose,
          }}
          id="wizard-project-mapping"
          isDisabled={isRequiredFieldsInvalid || isSubmitting}
          name={t('Project mapping')}
        >
          <Form>
            <ProjectMapping />
            {apiError && (
              <FormGroup>
                <ErrorAlert error={apiError} />
              </FormGroup>
            )}
            {isSubmitSuccessful && isEmpty(apiError) && (
              <FormGroup>
                <Alert
                  title={t("Network '{{name}}' has been created successfully.", { name })}
                  variant="success"
                >
                  <Button
                    onClick={() => {
                      navigate(`${VM_NETWORKS_PATH}/${name}`);
                    }}
                    isInline
                    variant={ButtonVariant.link}
                  >
                    {t('View network')}
                  </Button>
                </Alert>
              </FormGroup>
            )}
          </Form>
        </WizardStep>
      </Wizard>
    </FormProvider>
  );
};

export default VMNetworkNewForm;
