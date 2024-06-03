import React, { FC, useMemo } from 'react';
import { VirtualMachineModel } from 'src/views/dashboard-extensions/utils';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import SecretNameLabel from '@kubevirt-utils/components/SSHSecretModal/components/SecretNameLabel';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import VMSSHSecretModal from '@kubevirt-utils/components/VMSSHSecretModal/VMSSHSecretModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import { asAccessReview } from '@kubevirt-utils/resources/shared';
import { getVMSSHSecretName } from '@kubevirt-utils/resources/vm';
import { k8sUpdate, K8sVerb, useAccessReview } from '@openshift-console/dynamic-plugin-sdk';
import { Stack } from '@patternfly/react-core';

import { useDynamicSSHInjection } from '../hooks/useDynamicSSHInjection';

import DynamicSSHKeyInjectionDescription from './DynamicSSHKeyInjectionDescription';

type SSHTabAuthorizedSSHKeyProps = {
  isCustomizeInstanceType?: boolean;
  onUpdateVM?: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine>;
  vm: V1VirtualMachine;
};
const SSHTabAuthorizedSSHKey: FC<SSHTabAuthorizedSSHKeyProps> = ({
  isCustomizeInstanceType,
  onUpdateVM,
  vm,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const [authorizedSSHKeys, updateAuthorizedSSHKeys, loaded] = useKubevirtUserSettings('ssh');
  const accessReview = asAccessReview(VirtualMachineModel, vm, 'update' as K8sVerb);
  const [canUpdateVM] = useAccessReview(accessReview || {});
  const secretName = useMemo(() => getVMSSHSecretName(vm), [vm]);
  const isDynamicSSHInjectionEnabled = useDynamicSSHInjection(vm);
  const isEditable =
    ((canUpdateVM && isDynamicSSHInjectionEnabled) || isCustomizeInstanceType) && loaded;

  const onSubmit = (updatedVM: V1VirtualMachine) =>
    onUpdateVM
      ? onUpdateVM(updatedVM)
      : k8sUpdate({
          data: updatedVM,
          model: VirtualMachineModel,
          name: updatedVM?.metadata?.name,
          ns: updatedVM?.metadata?.namespace,
        });

  return (
    <VirtualMachineDescriptionItem
      descriptionData={
        <Stack hasGutter>
          <SecretNameLabel secretName={secretName} />
          <DynamicSSHKeyInjectionDescription
            isDynamicSSHInjectionEnabled={isDynamicSSHInjectionEnabled}
          />
        </Stack>
      }
      onEditClick={() =>
        createModal((modalProps) => (
          <VMSSHSecretModal
            {...modalProps}
            authorizedSSHKeys={authorizedSSHKeys}
            updateAuthorizedSSHKeys={updateAuthorizedSSHKeys}
            updateVM={onSubmit}
            vm={vm}
          />
        ))
      }
      data-test-id="public-ssh-key"
      descriptionHeader={<SearchItem id="public-ssh-key">{t('Public SSH key')}</SearchItem>}
      isEdit={isEditable}
      showEditOnTitle
    />
  );
};

export default SSHTabAuthorizedSSHKey;
