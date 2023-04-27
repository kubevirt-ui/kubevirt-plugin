import React, { FC, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import produce from 'immer';

import { SSHSecretCredentials } from '@catalog/CreateFromInstanceTypes/components/VMDetailsSection/components/SSHKeySection/utils/types';
import {
  BootableVolume,
  DEFAULT_INSTANCETYPE_LABEL,
} from '@catalog/CreateFromInstanceTypes/utils/constants';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { createVmSSHSecret } from '@kubevirt-utils/components/CloudinitModal/utils/cloudinit-utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getResourceUrl } from '@kubevirt-utils/resources/shared';
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

type CreateVMFooterProps = {
  vm: V1VirtualMachine;
  onCancel: () => void;
  selectedBootableVolume: BootableVolume;
  sshSecretCredentials: SSHSecretCredentials;
  pvcSource: IoK8sApiCoreV1PersistentVolumeClaim;
};

const CreateVMFooter: FC<CreateVMFooterProps> = ({
  vm,
  onCancel,
  selectedBootableVolume,
  sshSecretCredentials,
  pvcSource,
}) => {
  const { t } = useKubevirtTranslation();
  const history = useHistory();
  const [startVM, setStartVM] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | any>(null);

  const { sshSecretName, sshSecretKey } = sshSecretCredentials;

  const [canCreateVM] = useAccessReview({
    resource: VirtualMachineModel.plural,
    verb: 'create' as K8sVerb,
    namespace: vm?.metadata?.namespace,
    group: VirtualMachineModel.apiGroup,
  });

  const hasNameAndInstanceType = useMemo(
    () =>
      !isEmpty(vm?.metadata?.name) &&
      (!isEmpty(selectedBootableVolume?.metadata?.labels?.[DEFAULT_INSTANCETYPE_LABEL]) ||
        !isEmpty(vm?.spec?.instancetype?.name)),
    [selectedBootableVolume, vm],
  );

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    const vmToCreate = produce(vm, (draftVM) => {
      draftVM.spec.running = startVM;
      draftVM.spec.dataVolumeTemplates[0].spec.storage.resources.requests.storage =
        pvcSource?.spec?.resources?.requests?.storage;
      if (sshSecretCredentials?.sshSecretName) {
        const cloudInitNoCloudVolume = vm.spec.template.spec.volumes?.find(
          (v) => v.cloudInitNoCloud,
        );
        if (cloudInitNoCloudVolume) {
          draftVM.spec.template.spec.volumes = vm.spec.template.spec.volumes.filter(
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
                  secretName: sshSecretName || `${vm.metadata.name}-ssh-key-${getRandomChars()}`,
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
