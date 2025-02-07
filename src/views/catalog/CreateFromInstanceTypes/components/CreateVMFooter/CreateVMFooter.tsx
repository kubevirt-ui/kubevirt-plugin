import React, { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import { useIsWindowsBootableVolume } from '@catalog/CreateFromInstanceTypes/utils/utils';
import { ConfigMapModel } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { SecretSelectionOption } from '@kubevirt-utils/components/SSHSecretModal/utils/types';
import {
  AUTOUNATTEND,
  generateNewSysprepConfig,
  UNATTEND,
} from '@kubevirt-utils/components/SysprepModal/sysprep-utils';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { VirtualMachineDetailsTab } from '@kubevirt-utils/constants/tabs-constants';
import { logITFlowEvent } from '@kubevirt-utils/extensions/telemetry/telemetry';
import {
  CREATE_VM_BUTTON_CLICKED,
  CREATE_VM_FAILED,
  CREATE_VM_SUCCEEDED,
  CUSTOMIZE_VM_BUTTON_CLICKED,
  VIEW_YAML_AND_CLI_CLICKED,
} from '@kubevirt-utils/extensions/telemetry/utils/constants';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import { createSSHSecret } from '@kubevirt-utils/resources/secret/utils';
import { getResourceUrl } from '@kubevirt-utils/resources/shared';
import useNamespaceUDN from '@kubevirt-utils/resources/udn/hooks/useNamespaceUDN';
import { useDriversImage } from '@kubevirt-utils/resources/vm/utils/disk/useDriversImage';
import { vmSignal } from '@kubevirt-utils/store/customizeInstanceType';
import { createHeadlessService } from '@kubevirt-utils/utils/headless-service';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { Checkbox, Stack, StackItem } from '@patternfly/react-core';

import ActionButtons from './components/ActionButtons/ActionButtons';
import YamlAndCLIViewerModal from './components/YamlAndCLIViewerModal/YamlAndCLIViewerModal';
import useGeneratedVM from './hooks/useGeneratedVM';

import './CreateVMFooter.scss';

const CreateVMFooter: FC = () => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<any | Error>(null);
  const { createModal } = useModal();
  const [_, driversImageLoading] = useDriversImage();

  const [authorizedSSHKeys, setAuthorizedSSHKeys] = useKubevirtUserSettings('ssh');

  const [activeNamespace] = useActiveNamespace();
  const [isUDNManagedNamespace] = useNamespaceUDN(
    activeNamespace === ALL_NAMESPACES_SESSION_KEY ? DEFAULT_NAMESPACE : activeNamespace,
  );

  const { instanceTypeVMState, setStartVM, setVM, startVM, vmNamespaceTarget } =
    useInstanceTypeVMStore();
  const { sshSecretCredentials, sysprepConfigMapData, vmName } = instanceTypeVMState;
  const { applyKeyToProject, secretOption, sshPubKey, sshSecretName } = sshSecretCredentials || {};
  const isWindowsOSVolume = useIsWindowsBootableVolume();

  const generatedVM = useGeneratedVM();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    logITFlowEvent(CREATE_VM_BUTTON_CLICKED, generatedVM);

    if (
      applyKeyToProject &&
      !isEmpty(sshSecretName) &&
      authorizedSSHKeys?.[vmNamespaceTarget] !== sshSecretName
    ) {
      setAuthorizedSSHKeys({ ...authorizedSSHKeys, [vmNamespaceTarget]: sshSecretName });
    }

    return k8sCreate({
      data: generatedVM,
      model: VirtualMachineModel,
    })
      .then(async (createdVM) => {
        if (secretOption === SecretSelectionOption.addNew) {
          createSSHSecret(sshPubKey, sshSecretName, vmNamespaceTarget);
        }

        if (isWindowsOSVolume) {
          const { data, name, shouldCreateNewConfigMap } = sysprepConfigMapData;
          const { autounattend, unattended } = data;

          if (shouldCreateNewConfigMap) {
            const configMap = generateNewSysprepConfig({
              data: { [AUTOUNATTEND]: autounattend, [UNATTEND]: unattended },
              sysprepName: name,
            });

            await k8sCreate<IoK8sApiCoreV1ConfigMap>({
              data: configMap,
              model: ConfigMapModel,
              ns: vmNamespaceTarget,
            });
          }
        }

        if (!isUDNManagedNamespace) createHeadlessService(createdVM);

        navigate(getResourceUrl({ model: VirtualMachineModel, resource: createdVM }));

        logITFlowEvent(CREATE_VM_SUCCEEDED, createdVM);
      })
      .catch((err) => {
        setError(err);
        logITFlowEvent(CREATE_VM_FAILED, null, { vmName: vmName });
      })
      .finally(() => setIsSubmitting(false));
  };

  const handleCustomize = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      await setVM(generatedVM);
      vmSignal.value = generatedVM;

      logITFlowEvent(CUSTOMIZE_VM_BUTTON_CLICKED, vmSignal.value);

      navigate(
        `/k8s/ns/${vmNamespaceTarget}/catalog/review/${VirtualMachineDetailsTab.Configurations}`,
      );
    } catch (err) {
      setError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="create-vm-instance-type-footer">
      <Stack hasGutter>
        {error && (
          <StackItem>
            <ErrorAlert error={error} />
          </StackItem>
        )}
        <StackItem>
          <Checkbox
            id="start-after-creation-checkbox"
            isChecked={startVM}
            label={t('Start this VirtualMachine after creation')}
            onChange={(_event, val) => setStartVM(val)}
          />
        </StackItem>
        <StackItem>
          <ActionButtons
            onViewYAML={() => {
              logITFlowEvent(VIEW_YAML_AND_CLI_CLICKED, null, { vmName: vmName });
              createModal((props) => <YamlAndCLIViewerModal vm={generatedVM} {...props} />);
            }}
            isLoading={isSubmitting || driversImageLoading}
            onCreate={handleSubmit}
            onCustomize={handleCustomize}
          />
        </StackItem>
      </Stack>
    </footer>
  );
};

export default CreateVMFooter;
