import React, { FC, useCallback, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import produce from 'immer';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import { DEFAULT_INSTANCETYPE_LABEL } from '@catalog/CreateFromInstanceTypes/utils/constants';
import { generateVM } from '@catalog/CreateFromInstanceTypes/utils/utils';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { createVmSSHSecret } from '@kubevirt-utils/components/CloudinitModal/utils/cloudinit-utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getResourceUrl } from '@kubevirt-utils/resources/shared';
import { getRandomChars, isEmpty } from '@kubevirt-utils/utils/utils';
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

import './CreateVMFooter.scss';

const CreateVMFooter: FC = () => {
  const { t } = useKubevirtTranslation();
  const history = useHistory();
  const [startVM, setStartVM] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | any>(null);

  const { instanceTypeVMState, activeNamespace, vmNamespaceTarget } = useInstanceTypeVMStore();
  const { sshSecretCredentials, selectedBootableVolume, pvcSource } = instanceTypeVMState;
  const { sshSecretName, sshSecretKey } = sshSecretCredentials;

  const updatedVM = useMemo(
    () => generateVM(instanceTypeVMState, vmNamespaceTarget),
    [instanceTypeVMState, vmNamespaceTarget],
  );

  const onCancel = useCallback(
    () => history.push(getResourceUrl({ model: VirtualMachineModel, activeNamespace })),
    [activeNamespace, history],
  );

  const [canCreateVM] = useAccessReview({
    resource: VirtualMachineModel.plural,
    verb: 'create' as K8sVerb,
    namespace: updatedVM?.metadata?.namespace,
    group: VirtualMachineModel.apiGroup,
  });

  const hasNameAndInstanceType = useMemo(
    () =>
      !isEmpty(getName(updatedVM)) &&
      (!isEmpty(selectedBootableVolume?.metadata?.labels?.[DEFAULT_INSTANCETYPE_LABEL]) ||
        !isEmpty(updatedVM?.spec?.instancetype?.name)),
    [selectedBootableVolume, updatedVM],
  );

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    const vmToCreate = produce(updatedVM, (draftVM) => {
      draftVM.spec.running = startVM;
      draftVM.spec.dataVolumeTemplates[0].spec.storage.resources.requests.storage =
        pvcSource?.spec?.resources?.requests?.storage;
      if (sshSecretName) {
        const cloudInitNoCloudVolume = updatedVM.spec.template.spec.volumes?.find(
          (v) => v.cloudInitNoCloud,
        );
        if (cloudInitNoCloudVolume) {
          draftVM.spec.template.spec.volumes = updatedVM.spec.template.spec.volumes.filter(
            (v) => !v.cloudInitNoCloud,
          );
          draftVM.spec.template.spec.volumes.push({
            name: cloudInitNoCloudVolume.name,
            cloudInitConfigDrive: { ...cloudInitNoCloudVolume.cloudInitNoCloud },
          });
        }
        draftVM.spec.template.spec.accessCredentials = [
          {
            sshPublicKey: {
              source: {
                secret: {
                  secretName: sshSecretName || `${getName(updatedVM)}-ssh-key-${getRandomChars()}`,
                },
              },
              propagationMethod: {
                configDrive: {},
              },
            },
          },
        ];
      }
    });

    return k8sCreate({
      data: vmToCreate,
      model: VirtualMachineModel,
    })
      .then((createdVM) => {
        if (!isEmpty(sshSecretKey)) {
          createVmSSHSecret(createdVM, sshSecretKey, sshSecretName);
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
