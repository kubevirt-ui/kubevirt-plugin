import React, { FC, useCallback, useMemo } from 'react';

import { modelToGroupVersionKind, SecretModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getInitialSSHDetails } from '@kubevirt-utils/resources/secret/utils';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getAccessCredentials, getVMSSHSecretName } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { isEqualObject } from '../NodeSelectorModal/utils/helpers';

import { SecretSelectionOption, SSHSecretDetails } from './utils/types';
import { addSecretToVM, createVmSSHSecret, detachVMSecret } from './utils/utils';
import SSHSecretModal from './SSHSecretModal';

type VMSSHSecretModalProps = {
  isOpen: boolean;
  onClose: () => void;
  updateVM: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
  vm: V1VirtualMachine;
};

const VMSSHSecretModal: FC<VMSSHSecretModalProps> = ({ isOpen, onClose, updateVM, vm }) => {
  const namespace = useMemo(() => getNamespace(vm), [vm]);
  const hasSSHKey = useMemo(() => !isEmpty(getAccessCredentials(vm)), [vm]);
  const secretName = useMemo(() => getVMSSHSecretName(vm), [vm]);

  const [secret] = useK8sWatchResource<IoK8sApiCoreV1Secret>(
    hasSSHKey && {
      groupVersionKind: modelToGroupVersionKind(SecretModel),
      isList: false,
      name: secretName,
      namespace,
    },
  );

  const initialSSHDetails = useMemo(() => getInitialSSHDetails(secretName), [secretName]);

  const onSubmit = useCallback(
    (sshDetails: SSHSecretDetails) => {
      const { secretOption, sshPubKey, sshSecretName } = sshDetails;

      if (isEqualObject(sshDetails, initialSSHDetails)) {
        return Promise.resolve();
      }

      if (
        secretOption === SecretSelectionOption.none &&
        initialSSHDetails.secretOption !== SecretSelectionOption.none
      ) {
        return detachVMSecret(vm, secret);
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
        return createVmSSHSecret(vm, sshPubKey, sshSecretName).then(() =>
          updateVM(addSecretToVM(vm, sshSecretName)),
        );
      }
    },
    [initialSSHDetails, secret, updateVM, vm],
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
