import React, { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import { SecretSelectionOption } from '@kubevirt-utils/components/SSHSecretModal/utils/types';
import { createSSHSecret } from '@kubevirt-utils/components/SSHSecretModal/utils/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import { getResourceUrl } from '@kubevirt-utils/resources/shared';
import { createHeadlessService } from '@kubevirt-utils/utils/headless-service';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';
import {
  Button,
  ButtonVariant,
  Checkbox,
  Split,
  SplitItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import './CustomizeITVMFooter.scss';

const CustomizeITVMFooter: FC = () => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<any | Error>(null);
  const { instanceTypeVMState, setStartVM, startVM, vm, vmNamespaceTarget } =
    useInstanceTypeVMStore();
  const [authorizedSSHKeys, setAuthorizedSSHKeys] = useKubevirtUserSettings('ssh');
  const { sshSecretCredentials } = instanceTypeVMState;
  const { applyKeyToProject, secretOption, sshPubKey, sshSecretName } = sshSecretCredentials || {};

  return (
    <footer className="customize-it-vm-footer">
      <Stack hasGutter>
        <StackItem>
          <ErrorAlert error={error} />
        </StackItem>
        <StackItem>
          <Checkbox
            id="start-after-create-checkbox"
            isChecked={startVM}
            label={t('Start this VirtualMachine after creation')}
            onChange={(_, checked: boolean) => setStartVM(checked)}
          />
        </StackItem>
        <StackItem />
        <div data-test-id="create-virtual-machine">
          <Split hasGutter>
            <SplitItem>
              <Button
                onClick={async () => {
                  if (
                    applyKeyToProject &&
                    !isEmpty(sshSecretName) &&
                    authorizedSSHKeys?.[vmNamespaceTarget] !== sshSecretName
                  ) {
                    setAuthorizedSSHKeys({
                      ...authorizedSSHKeys,
                      [vmNamespaceTarget]: sshSecretName,
                    });
                  }
                  setIsSubmitting(true);
                  setError(null);

                  try {
                    const createdVM = await k8sCreate({
                      data: vm,
                      model: VirtualMachineModel,
                    });
                    if (secretOption === SecretSelectionOption.addNew) {
                      createSSHSecret(sshPubKey, sshSecretName, vmNamespaceTarget);
                    }
                    createHeadlessService(createdVM);
                    navigate(getResourceUrl({ model: VirtualMachineModel, resource: createdVM }));
                  } catch (err) {
                    setError(err);
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                isLoading={isSubmitting}
                variant={ButtonVariant.primary}
              >
                {t('Create VirtualMachine')}
              </Button>
            </SplitItem>
            <SplitItem>
              <Button
                onClick={() => navigate(`/k8s/ns/${vmNamespaceTarget}/catalog`)}
                variant={ButtonVariant.link}
              >
                {t('Cancel')}
              </Button>
            </SplitItem>
          </Split>
        </div>
      </Stack>
    </footer>
  );
};

export default CustomizeITVMFooter;
