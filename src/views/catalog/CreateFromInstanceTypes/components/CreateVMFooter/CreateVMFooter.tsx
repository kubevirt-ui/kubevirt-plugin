import React, { FC, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import {
  generateVM,
  useIsWindowsBootableVolume,
} from '@catalog/CreateFromInstanceTypes/utils/utils';
import { ConfigMapModel } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { SecretSelectionOption } from '@kubevirt-utils/components/SSHSecretModal/utils/types';
import { createSSHSecret } from '@kubevirt-utils/components/SSHSecretModal/utils/utils';
import {
  AUTOUNATTEND,
  generateNewSysprepConfig,
  UNATTEND,
} from '@kubevirt-utils/components/SysprepModal/sysprep-utils';
import { VirtualMachineDetailsTab } from '@kubevirt-utils/constants/tabs-constants';
import { logITFlowEvent } from '@kubevirt-utils/extensions/telemetry/telemetry';
import {
  CANCEL_CREATE_VM_BUTTON_CLICKED,
  CREATE_VM_BUTTON_CLICKED,
  CREATE_VM_FAILED,
  CREATE_VM_SUCCEEDED,
  CUSTOMIZE_VM_BUTTON_CLICKED,
  VIEW_YAML_AND_CLI_CLICKED,
} from '@kubevirt-utils/extensions/telemetry/utils/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import useRHELAutomaticSubscription from '@kubevirt-utils/hooks/useRHELAutomaticSubscription/useRHELAutomaticSubscription';
import { getResourceUrl } from '@kubevirt-utils/resources/shared';
import { vmSignal } from '@kubevirt-utils/store/customizeInstanceType';
import { createHeadlessService } from '@kubevirt-utils/utils/headless-service';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { k8sCreate, K8sVerb, useAccessReview } from '@openshift-console/dynamic-plugin-sdk';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import {
  Button,
  ButtonVariant,
  Checkbox,
  Split,
  SplitItem,
  Stack,
  StackItem,
  Tooltip,
} from '@patternfly/react-core';

import { AUTOMATIC_UPDATE_FEATURE_NAME } from '../../../../clusteroverview/SettingsTab/ClusterTab/components/GuestManagmentSection/AutomaticSubscriptionRHELGuests/utils/constants';

import YamlAndCLIViewerModal from './components/YamlAndCLIViewerModal/YamlAndCLIViewerModal';

import './CreateVMFooter.scss';

const CreateVMFooter: FC = () => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<any | Error>(null);
  const { createModal } = useModal();

  const { featureEnabled: autoUpdateEnabled } = useFeatures(AUTOMATIC_UPDATE_FEATURE_NAME);

  const [authorizedSSHKeys, setAuthorizedSSHKeys] = useKubevirtUserSettings('ssh');
  const { subscriptionData } = useRHELAutomaticSubscription();

  const [activeNamespace] = useActiveNamespace();
  const { instanceTypeVMState, setStartVM, setVM, startVM, vmNamespaceTarget } =
    useInstanceTypeVMStore();
  const {
    selectedBootableVolume,
    selectedInstanceType,
    sshSecretCredentials,
    sysprepConfigMapData,
    vmName,
  } = instanceTypeVMState;
  const { applyKeyToProject, secretOption, sshPubKey, sshSecretName } = sshSecretCredentials || {};
  const isWindowsOSVolume = useIsWindowsBootableVolume();

  const onCancel = useCallback(() => {
    logITFlowEvent(CANCEL_CREATE_VM_BUTTON_CLICKED, null, { vmName: vmName });
    navigate(getResourceUrl({ activeNamespace, model: VirtualMachineModel }));
  }, [activeNamespace, navigate, vmName]);

  const [canCreateVM] = useAccessReview({
    group: VirtualMachineModel.apiGroup,
    namespace: vmNamespaceTarget,
    resource: VirtualMachineModel.plural,
    verb: 'create' as K8sVerb,
  });

  const hasNameAndInstanceType = useMemo(
    () => !isEmpty(vmName) && !isEmpty(selectedInstanceType),
    [vmName, selectedInstanceType],
  );

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    const vmToCreate = generateVM(
      instanceTypeVMState,
      vmNamespaceTarget,
      startVM,
      subscriptionData,
      autoUpdateEnabled,
    );

    logITFlowEvent(CREATE_VM_BUTTON_CLICKED, vmToCreate);

    if (
      applyKeyToProject &&
      !isEmpty(sshSecretName) &&
      authorizedSSHKeys?.[vmNamespaceTarget] !== sshSecretName
    ) {
      setAuthorizedSSHKeys({ ...authorizedSSHKeys, [vmNamespaceTarget]: sshSecretName });
    }

    return k8sCreate({
      data: vmToCreate,
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

        createHeadlessService(createdVM);
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
      await setVM(
        generateVM(
          instanceTypeVMState,
          vmNamespaceTarget,
          startVM,
          subscriptionData,
          autoUpdateEnabled,
        ),
      );
      vmSignal.value = generateVM(
        instanceTypeVMState,
        vmNamespaceTarget,
        startVM,
        subscriptionData,
        autoUpdateEnabled,
      );

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

  const isDisabled =
    isSubmitting || isEmpty(selectedBootableVolume) || !canCreateVM || !hasNameAndInstanceType;

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
          <Split hasGutter>
            <SplitItem>
              <Tooltip
                content={
                  <Stack className="cpu-helper-text__body-content">
                    {t('Ask your cluster administrator for access permissions.')}
                  </Stack>
                }
                hidden={!isDisabled}
              >
                <Button
                  isAriaDisabled={isDisabled}
                  isLoading={isSubmitting}
                  onClick={handleSubmit}
                  variant={ButtonVariant.primary}
                >
                  {t('Create VirtualMachine')}
                </Button>
              </Tooltip>
            </SplitItem>
            <SplitItem>
              <Button
                isDisabled={
                  isSubmitting ||
                  isEmpty(selectedBootableVolume) ||
                  !canCreateVM ||
                  !hasNameAndInstanceType
                }
                isLoading={isSubmitting}
                onClick={handleCustomize}
                variant={ButtonVariant.secondary}
              >
                {t('Customize VirtualMachine')}
              </Button>
            </SplitItem>

            <SplitItem>
              <Button onClick={onCancel} variant={ButtonVariant.link}>
                {t('Cancel')}
              </Button>
            </SplitItem>
            <SplitItem isFilled />
            <SplitItem>
              <Button
                onClick={() => {
                  logITFlowEvent(VIEW_YAML_AND_CLI_CLICKED, null, { vmName: vmName });
                  createModal((props) => (
                    <YamlAndCLIViewerModal
                      vm={generateVM(
                        instanceTypeVMState,
                        vmNamespaceTarget,
                        startVM,
                        subscriptionData,
                        autoUpdateEnabled,
                      )}
                      {...props}
                    />
                  ));
                }}
                isDisabled={isEmpty(selectedBootableVolume) || !hasNameAndInstanceType}
                variant={ButtonVariant.secondary}
              >
                {t('View YAML & CLI')}
              </Button>
            </SplitItem>
          </Split>
        </StackItem>
      </Stack>
    </footer>
  );
};

export default CreateVMFooter;
