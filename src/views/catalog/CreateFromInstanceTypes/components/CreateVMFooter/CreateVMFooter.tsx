import React, { FC, useState } from 'react';
import { useHistory } from 'react-router-dom';
import produce from 'immer';

import { SSHSecretCredentials } from '@catalog/CreateFromInstanceTypes/components/VMDetailsSection/components/SSHKeySection/utils/types';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { createVmSSHSecret } from '@kubevirt-utils/components/CloudinitModal/utils/cloudinit-utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getResourceUrl } from '@kubevirt-utils/resources/shared';
import { getPVC } from '@kubevirt-utils/resources/template/hooks/useVmTemplateSource/utils';
import { getRandomChars, isEmpty } from '@kubevirt-utils/utils/utils';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';
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
  selectedBootableVolume: V1beta1DataSource;
  sshSecretCredentials: SSHSecretCredentials;
};

const CreateVMFooter: FC<CreateVMFooterProps> = ({
  vm,
  onCancel,
  selectedBootableVolume,
  sshSecretCredentials,
}) => {
  const { t } = useKubevirtTranslation();
  const history = useHistory();
  const [startVM, setStartVM] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | any>(null);

  const { sshSecretName, sshSecretKey } = sshSecretCredentials;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    const pvc = await getPVC(
      selectedBootableVolume?.spec?.source?.pvc?.name,
      selectedBootableVolume?.spec?.source?.pvc?.namespace,
    );

    const vmToCreate = produce(vm, (draftVM) => {
      draftVM.spec.running = startVM;
      draftVM.spec.dataVolumeTemplates[0].spec.storage.resources.requests.storage =
        pvc?.spec?.resources?.requests?.storage;
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
                isDisabled={isSubmitting}
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
