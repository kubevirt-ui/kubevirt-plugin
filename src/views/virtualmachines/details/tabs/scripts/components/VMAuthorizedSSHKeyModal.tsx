import React from 'react';

import { SecretModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { k8sGet } from '@openshift-console/dynamic-plugin-sdk';
import { FileUpload } from '@patternfly/react-core';

import { changeVMSecret, decodeSecret } from '../utils';

export const VMAuthorizedSSHKeyModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  vm: V1VirtualMachine;
}> = ({ vm, onClose, isOpen }) => {
  const { t } = useKubevirtTranslation();
  const namespace = vm?.metadata?.namespace;
  const sshSecret =
    vm?.spec?.template?.spec?.accessCredentials?.[0]?.sshPublicKey?.source?.secret?.secretName;

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
