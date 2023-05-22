import React, { FC, useCallback, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import { generateVM } from '@catalog/CreateFromInstanceTypes/utils/utils';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { SecretSelectionOption } from '@kubevirt-utils/components/SSHSecretSection/utils/types';
import { createVmSSHSecret } from '@kubevirt-utils/components/SSHSecretSection/utils/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getResourceUrl } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { k8sCreate, K8sVerb, useAccessReview } from '@openshift-console/dynamic-plugin-sdk';
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
import { EyeIcon } from '@patternfly/react-icons';

import YamlAndCLIViewerModal from './components/YamlAndCLIViewerModal/YamlAndCLIViewerModal';

import './CreateVMFooter.scss';

const CreateVMFooter: FC = () => {
  const { t } = useKubevirtTranslation();
  const history = useHistory();
  const [startVM, setStartVM] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | any>(null);
  const { createModal } = useModal();

  const { instanceTypeVMState, activeNamespace, vmNamespaceTarget } = useInstanceTypeVMStore();
  const { sshSecretCredentials, selectedBootableVolume, vmName, selectedInstanceType } =
    instanceTypeVMState;
  const { sshSecretName, sshPubKey, secretOption } = sshSecretCredentials;

  const onCancel = useCallback(
    () => history.push(getResourceUrl({ model: VirtualMachineModel, activeNamespace })),
    [activeNamespace, history],
  );

  const [canCreateVM] = useAccessReview({
    resource: VirtualMachineModel.plural,
    verb: 'create' as K8sVerb,
    namespace: vmNamespaceTarget,
    group: VirtualMachineModel.apiGroup,
  });

  const hasNameAndInstanceType = useMemo(
    () => !isEmpty(vmName) && !isEmpty(selectedInstanceType),
    [vmName, selectedInstanceType],
  );

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    const vmToCreate = generateVM(instanceTypeVMState, vmNamespaceTarget, startVM);

    return k8sCreate({
      data: vmToCreate,
      model: VirtualMachineModel,
    })
      .then((createdVM) => {
        if (secretOption === SecretSelectionOption.addNew) {
          createVmSSHSecret(createdVM, sshPubKey, sshSecretName);
        }
        history.push(getResourceUrl({ model: VirtualMachineModel, resource: vmToCreate }));
      })
      .catch(setError)
      .finally(() => setIsSubmitting(false));
  };

  return (
    <footer className="create-vm-instance-type-footer">
      <Stack hasGutter>
        {error && (
          <StackItem>
            <Alert isInline variant={AlertVariant.danger} title={t('An error occurred')}>
              <Stack hasGutter>
                <StackItem>{error.message}</StackItem>
                {error?.href && (
                  <StackItem>
                    <a href={error.href} target="_blank" rel="noreferrer">
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
            id="start-after-create-checkbox"
            isChecked={startVM}
            onChange={setStartVM}
            label={t('Start this VirtualMachine after creation')}
          />
        </StackItem>
        <StackItem>
          <Split hasGutter>
            <SplitItem>
              <Button
                isLoading={isSubmitting}
                isDisabled={
                  isSubmitting ||
                  isEmpty(selectedBootableVolume) ||
                  !canCreateVM ||
                  !hasNameAndInstanceType
                }
                onClick={handleSubmit}
                variant={ButtonVariant.primary}
              >
                {t('Create VirtualMachine')}
              </Button>
            </SplitItem>
            <SplitItem>
              <Button
                variant={ButtonVariant.secondary}
                icon={<EyeIcon />}
                isDisabled={isEmpty(selectedBootableVolume) || !hasNameAndInstanceType}
                onClick={() =>
                  createModal((props) => (
                    <YamlAndCLIViewerModal
                      vm={generateVM(instanceTypeVMState, vmNamespaceTarget, startVM)}
                      {...props}
                    />
                  ))
                }
              >
                YAML & CLI
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
