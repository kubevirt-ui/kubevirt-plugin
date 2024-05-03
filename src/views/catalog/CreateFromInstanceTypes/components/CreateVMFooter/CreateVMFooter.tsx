import React, { FC, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import { DEFAULT_PREFERENCE_LABEL } from '@catalog/CreateFromInstanceTypes/utils/constants';
import { generateVM } from '@catalog/CreateFromInstanceTypes/utils/utils';
import { ConfigMapModel } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { SecretSelectionOption } from '@kubevirt-utils/components/SSHSecretModal/utils/types';
import { createSSHSecret } from '@kubevirt-utils/components/SSHSecretModal/utils/utils';
import {
  addSysprepConfig,
  AUTOUNATTEND,
  generateNewSysprepConfig,
  UNATTEND,
} from '@kubevirt-utils/components/SysprepModal/sysprep-utils';
import { VirtualMachineDetailsTab } from '@kubevirt-utils/constants/tabs-constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import useRHELAutomaticSubscription from '@kubevirt-utils/hooks/useRHELAutomaticSubscription/useRHELAutomaticSubscription';
import { getLabel, getResourceUrl } from '@kubevirt-utils/resources/shared';
import { OS_WINDOWS_PREFIX } from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
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
  const defaultPreferenceName = getLabel(selectedBootableVolume, DEFAULT_PREFERENCE_LABEL);
  const isWindowsOSVolume = defaultPreferenceName?.startsWith(OS_WINDOWS_PREFIX) || false;

  const onCancel = useCallback(
    () => navigate(getResourceUrl({ activeNamespace, model: VirtualMachineModel })),
    [activeNamespace, navigate],
  );

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
      .then((createdVM) => {
        if (secretOption === SecretSelectionOption.addNew) {
          createSSHSecret(sshPubKey, sshSecretName, vmNamespaceTarget);
        }

        // create appropriate ConfigMap and/or add it to the Windows VM if sysprep configured
        if (isWindowsOSVolume) {
          const { data, name } = sysprepConfigMapData;
          const { autounattend, unattended } = data;

          if (!isEmpty(data) && !name) {
            // the user has chosen to add new ConfigMap with new data
            const configMap = generateNewSysprepConfig({
              data: { [AUTOUNATTEND]: autounattend, [UNATTEND]: unattended },
              vm: createdVM,
            });

            k8sCreate({ data: configMap, model: ConfigMapModel });
            addSysprepConfig(createdVM, configMap.metadata.name); // add ConfigMap and related volume and disk to the new VM
          }

          if (name) {
            // if user has chosen some existing ConfigMap from the list
            addSysprepConfig(createdVM, name);
          }
        }

        createHeadlessService(createdVM);
        navigate(getResourceUrl({ model: VirtualMachineModel, resource: vmToCreate }));
      })
      .catch(setError)
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
          <Split hasGutter>
            <SplitItem>
              <Button
                isDisabled={
                  isSubmitting ||
                  isEmpty(selectedBootableVolume) ||
                  !canCreateVM ||
                  !hasNameAndInstanceType
                }
                isLoading={isSubmitting}
                onClick={handleSubmit}
                variant={ButtonVariant.primary}
              >
                {t('Create VirtualMachine')}
              </Button>
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
                onClick={() =>
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
                  ))
                }
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
