import React, { FC, useCallback, useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getInitialSSHDetails } from '@kubevirt-utils/resources/secret/utils';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getVMSSHSecretName } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { isEqualObject } from '../NodeSelectorModal/utils/helpers';

import { SecretSelectionOption, SSHSecretDetails } from './utils/types';
import { addSecretToVM, createSSHSecret, detachVMSecret } from './utils/utils';
import SSHSecretModal from './SSHSecretModal';

type VMSSHSecretModalProps = {
  authorizedSSHKeys: { [namespace: string]: string };
  isOpen: boolean;
  onClose: () => void;
  updateAuthorizedSSHKeys: (val: any) => void;
  updateVM: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
  vm: V1VirtualMachine;
};

const VMSSHSecretModal: FC<VMSSHSecretModalProps> = ({
  authorizedSSHKeys,
  isOpen,
  onClose,
  updateAuthorizedSSHKeys,
  updateVM,
  vm,
}) => {
  const [namespace, secretName] = useMemo(() => [getNamespace(vm), getVMSSHSecretName(vm)], [vm]);

  const initialSSHDetails = useMemo(
    () =>
      getInitialSSHDetails({
        applyKeyToProject: !isEmpty(secretName) && authorizedSSHKeys?.[namespace] === secretName,
        sshSecretName: secretName,
      }),
    [authorizedSSHKeys, namespace, secretName],
  );

  const onSubmit = useCallback(
    (sshDetails: SSHSecretDetails) => {
      const { applyKeyToProject, secretOption, sshPubKey, sshSecretName } = sshDetails;

      if (isEqualObject(sshDetails, initialSSHDetails)) {
        return Promise.resolve();
      }

      if (applyKeyToProject && authorizedSSHKeys?.[namespace] !== sshSecretName) {
        updateAuthorizedSSHKeys({ ...authorizedSSHKeys, [namespace]: sshSecretName });
      }

      if (
        secretOption === SecretSelectionOption.none &&
        initialSSHDetails.secretOption !== SecretSelectionOption.none
      ) {
        return detachVMSecret(vm);
      }

      if (
        secretOption === SecretSelectionOption.useExisting &&
        initialSSHDetails.sshSecretName !== sshSecretName &&
        !isEmpty(sshSecretName)
      ) {
        return updateVM(addSecretToVM(vm, sshSecretName));
      }

      if (
        secretOption === SecretSelectionOption.addNew &&
        !isEmpty(sshPubKey) &&
        !isEmpty(sshSecretName)
      ) {
        return createSSHSecret(sshPubKey, sshSecretName, getNamespace(vm)).then(() =>
          updateVM(addSecretToVM(vm, sshSecretName)),
        );
      }

      return Promise.resolve();
    },
    [authorizedSSHKeys, initialSSHDetails, namespace, updateAuthorizedSSHKeys, updateVM, vm],
  );

  return (
    <SSHSecretModal
      initialSSHSecretDetails={initialSSHDetails}
      isOpen={isOpen}
      namespace={namespace}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
};

export default VMSSHSecretModal;
