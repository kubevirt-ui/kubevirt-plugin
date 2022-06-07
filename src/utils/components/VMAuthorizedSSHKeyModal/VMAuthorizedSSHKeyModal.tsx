import React from 'react';

import { modelToGroupVersionKind, SecretModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ModalPendingChangesAlert } from '@kubevirt-utils/components/PendingChanges/ModalPendingChangesAlert/ModalPendingChangesAlert';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { k8sGet, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { FileUpload } from '@patternfly/react-core';

import { changeVMSecret, decodeSecret } from './utils';

export const VMAuthorizedSSHKeyModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
}> = ({ vm, onClose, isOpen, vmi }) => {
  const { t } = useKubevirtTranslation();
  const namespace = vm?.metadata?.namespace;
  const sshSecret =
    vm?.spec?.template?.spec?.accessCredentials?.[0]?.sshPublicKey?.source?.secret?.secretName;
  const [vmiSSHSecret] = useK8sWatchResource<IoK8sApiCoreV1Secret>({
    groupVersionKind: modelToGroupVersionKind(SecretModel),
    name: vmi?.spec?.accessCredentials?.[0]?.sshPublicKey?.source?.secret?.secretName,
    namespace,
  });

  const [secret, setSecret] = React.useState<IoK8sApiCoreV1Secret>();
  const [value, setValue] = React.useState('');
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const onSubmit = () => {
    if (value !== decodeSecret(secret)) {
      return changeVMSecret(vm, secret, value);
    }
    return Promise.resolve();
  };

  React.useEffect(() => {
    if (isOpen && sshSecret) {
      setIsLoading(true);
      k8sGet<IoK8sApiCoreV1Secret>({
        model: SecretModel,
        name: sshSecret,
        ns: namespace,
      })
        .then((s) => {
          setSecret(s);
          setValue(decodeSecret(s));
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, sshSecret, namespace]);

  return (
    <TabModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      headerText={t('Authorized SSH Key')}
    >
      {vmi && <ModalPendingChangesAlert isChanged={decodeSecret(vmiSSHSecret) !== value} />}
      <FileUpload
        id={'ssh-key-modal'}
        type="text"
        value={value}
        onChange={(v) => setValue(v as string)}
        onReadStarted={() => setIsLoading(true)}
        onReadFinished={() => setIsLoading(false)}
        isLoading={isLoading}
        allowEditingUploadedText
        isReadOnly={false}
      />
    </TabModal>
  );
};
