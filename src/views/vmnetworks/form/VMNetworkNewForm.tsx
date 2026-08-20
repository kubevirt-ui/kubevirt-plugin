import React, { type FC, useEffect, useRef, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router';

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
import { Form, FormGroup, ValidatedOptions, Wizard, WizardStep } from '@patternfly/react-core';

import { VM_NETWORKS_PATH } from '../constants';
import { isValidProjectMapping } from '../utils';

import NetworkDefinition from './components/NetworkDefinition';
import ProjectMapping from './components/ProjectMapping';
import VMNetworkWizardHeader from './components/VMNetworkWizardHeader';
import {
  getDefaultFormValue,
  NODE_NETWORK_MAPPING_PARAM_KEY,
  type VMNetworkForm,
} from './constants';
import { getVLANIDValidatedOption } from './utils/utils';

const VMNetworkNewForm: FC = () => {
  const navigate = useNavigate();
  const { t } = useKubevirtTranslation();
  const [apiError, setApiError] = useState<Error>(null);

  const params = useQuery();
  const nodeNetworkMapping = params.get(NODE_NETWORK_MAPPING_PARAM_KEY) ?? '';

  const completedRef = useRef(false);
  const currentStepIdRef = useRef<number | string>('wizard-network-definition');

  useEffect(() => {
    logEventWithName(VM_NETWORK_CREATION_STARTED);
  }, []);

  useEffect(() => {
    return (): void => {
      if (!completedRef.current) {
        logEventWithName(VM_NETWORK_ABANDONED, { stepId: currentStepIdRef.current });
      }
    };
  }, []);

  const methods = useForm<VMNetworkForm>({
    defaultValues: getDefaultFormValue(nodeNetworkMapping),
  });

  const {
    control,
    formState: { isSubmitting },
    handleSubmit,
  } = methods;

  const name = useWatch({ control, name: 'network.metadata.name' });
  const bridgeMapping = useWatch({
    control,
    name: 'network.spec.network.localnet.physicalNetworkName',
  });
  const mtu = useWatch({ control, name: 'network.spec.network.localnet.mtu' });
  const vlan = useWatch({ control, name: 'network.spec.network.localnet.vlan' });
  const namespaceSelector = useWatch({ control, name: 'network.spec.namespaceSelector' });
  const projectMappingOption = useWatch({ control, name: 'projectMappingOption' });

  const isVLANInvalid =
    vlan?.mode &&
    (isEmpty(vlan.access?.id) ||
      getVLANIDValidatedOption(vlan?.access?.id) !== ValidatedOptions.default);
  const isRequiredFieldsInvalid =
    isEmpty(name) || isEmpty(bridgeMapping) || isEmpty(mtu) || mtu > MAX_MTU || isVLANInvalid;

  const isProjectMappingInvalid = !isValidProjectMapping(projectMappingOption, namespaceSelector);

  const onSubmit = async (data: VMNetworkForm): Promise<void> => {
    try {
      await k8sCreate({
        data: data.network,
        model: ClusterUserDefinedNetworkModel,
      });

      completedRef.current = true;
      logVMNetworkCreated(data.network, data.projectMappingOption);

      navigate(`${VM_NETWORKS_PATH}/${name}`);
    } catch (error) {
      completedRef.current = true;
      logCreationFailed(VM_NETWORK_CREATION_FAILED, error);
      setApiError(error as Error);
    }
  };

  const onClose = (): void => {
    navigate(VM_NETWORKS_PATH);
  };

  return (
    <FormProvider {...methods}>
      <Wizard
        header={<VMNetworkWizardHeader />}
        onSave={(evt) => handleSubmit(onSubmit)(evt)}
        onStepChange={(_evt, currentStep) => {
          currentStepIdRef.current = currentStep.id;
        }}
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
          </Form>
        </WizardStep>
      </Wizard>
    </FormProvider>
  );
};

export default VMNetworkNewForm;
