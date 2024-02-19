import React, { FC, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import { generateVM } from '@catalog/CreateFromInstanceTypes/utils/utils';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { SecretSelectionOption } from '@kubevirt-utils/components/SSHSecretSection/utils/types';
import { createSSHSecret } from '@kubevirt-utils/components/SSHSecretSection/utils/utils';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import useRHELAutomaticSubscription from '@kubevirt-utils/hooks/useRHELAutomaticSubscription/useRHELAutomaticSubscription';
import { getResourceUrl } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { k8sCreate, K8sVerb, useAccessReview } from '@openshift-console/dynamic-plugin-sdk';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import {
  Alert,
  AlertVariant,
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
  const [startVM, setStartVM] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<any | Error>(null);
  const { createModal } = useModal();

  const { featureEnabled: autoUpdateEnabled } = useFeatures(AUTOMATIC_UPDATE_FEATURE_NAME);

  const [authorizedSSHKeys, setAuthorizedSSHKeys] = useKubevirtUserSettings('ssh');
  const { subscriptionData } = useRHELAutomaticSubscription();

  const [activeNamespace] = useActiveNamespace();
  const { instanceTypeVMState, vmNamespaceTarget } = useInstanceTypeVMStore();
  const { selectedBootableVolume, selectedInstanceType, sshSecretCredentials, vmName } =
    instanceTypeVMState;
  const { applyKeyToProject, secretOption, sshPubKey, sshSecretName } = sshSecretCredentials || {};

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
      .then(() => {
        if (secretOption === SecretSelectionOption.addNew) {
          createSSHSecret(sshPubKey, sshSecretName, vmNamespaceTarget);
        }
        navigate(getResourceUrl({ model: VirtualMachineModel, resource: vmToCreate }));
      })
      .catch(setError)
      .finally(() => setIsSubmitting(false));
  };

  return (
    <footer className="create-vm-instance-type-footer">
      <Stack hasGutter>
        {error && (
          <StackItem>
            <Alert isInline title={t('An error occurred')} variant={AlertVariant.danger}>
              <Stack hasGutter>
                <StackItem>{error.message}</StackItem>
                {error?.href && (
                  <StackItem>
                    <a href={error.href} rel="noreferrer" target="_blank">
                      {error.href}
                    </a>
                  </StackItem>
                )}
              </Stack>
            </Alert>
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
            <SplitItem>
              <Button onClick={onCancel} variant={ButtonVariant.link}>
                {t('Cancel')}
              </Button>
            </SplitItem>
          </Split>
        </StackItem>
      </Stack>
    </footer>
  );
};

export default CreateVMFooter;
