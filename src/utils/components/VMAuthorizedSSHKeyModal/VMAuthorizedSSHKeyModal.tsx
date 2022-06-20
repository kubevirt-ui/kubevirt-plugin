import React from 'react';

import { modelToGroupVersionKind, SecretModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ModalPendingChangesAlert } from '@kubevirt-utils/components/PendingChanges/ModalPendingChangesAlert/ModalPendingChangesAlert';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { validateSSHPublicKey } from '@kubevirt-utils/utils/utils';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import {
  Alert,
  AlertActionCloseButton,
  AlertVariant,
  Button,
  ButtonVariant,
  ExpandableSection,
  FileUpload,
  HelperText,
  HelperTextItem,
} from '@patternfly/react-core';

import SelectSecret from './SelectSecret';
import { attachVMSecret, changeVMSecret, decodeSecret, detachVMSecret } from './utils';

import './vm-auth-ssh-key-modal.scss';

export const VMAuthorizedSSHKeyModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
}> = ({ vm, onClose, isOpen, vmi }) => {
  const { t } = useKubevirtTranslation();
  const [newSecretSectionOpen, setNewSecretSectionOpen] = React.useState(true);
  const [selectedAttachSecret, setSelectedAttachSecret] = React.useState<IoK8sApiCoreV1Secret>();
  const [detachingSecret, setDetachingSecret] = React.useState(false);
  const [detachingError, setDetachingError] = React.useState<Error>();
  const namespace = vm?.metadata?.namespace;
  const sshSecretName =
    vm?.spec?.template?.spec?.accessCredentials?.[0]?.sshPublicKey?.source?.secret?.secretName;

  const [secret, secretLoaded] = useK8sWatchResource<IoK8sApiCoreV1Secret>(
    sshSecretName
      ? {
          groupVersionKind: modelToGroupVersionKind(SecretModel),
          name: sshSecretName,
          namespace,
        }
      : null,
  );

  const [value, setValue] = React.useState('');
  const [isLoadingFile, setIsLoading] = React.useState(false);
  const [isValidatedKey, setIsValidatedKey] = React.useState<boolean>(true);

  const vmOwnSecret = React.useMemo(
    () => secret?.metadata?.ownerReferences?.length === 1,
    [secret],
  );

  const onSubmit = () => {
    if (!newSecretSectionOpen && selectedAttachSecret)
      return attachVMSecret(vm, secret, selectedAttachSecret);
    else if (vmOwnSecret && value === decodeSecret(secret)) return;
    else return changeVMSecret(vm, secret, value);
  };

  React.useEffect(() => {
    if (!secretLoaded) return;

    if (secret && vmOwnSecret) {
      const key = decodeSecret(secret)?.trim();
      setValue(key);
      setIsValidatedKey(validateSSHPublicKey(key));
      setSelectedAttachSecret(secret);
    } else if (secret) {
      setSelectedAttachSecret(secret);
      setNewSecretSectionOpen(false);
    }
  }, [secret, secretLoaded, vmOwnSecret]);

  const detachSecret = async () => {
    setDetachingSecret(true);
    try {
      await detachVMSecret(vm, secret);
      setSelectedAttachSecret(undefined);
      onClose();
    } catch (error) {
      setDetachingError(error);
    }
    setDetachingSecret(false);
  };

  const removingSecret = async () => {
    setDetachingSecret(true);
    try {
      await changeVMSecret(vm, secret);
      setValue('');
    } catch (error) {
      setDetachingError(error);
    }
    setDetachingSecret(false);
  };

  return (
    <TabModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      headerText={t('Authorized SSH Key')}
      isDisabled={!isValidatedKey}
    >
      <div className="vm-auth-ssh-key-modal">
        {vmi && secretLoaded && (
          <ModalPendingChangesAlert isChanged={decodeSecret(secret) !== value} />
        )}

        <ExpandableSection
          toggleText={vmOwnSecret ? t('Edit secret') : t('Create new secret')}
          data-test-id="expandable-new-secret-section"
          onToggle={() => setNewSecretSectionOpen(!newSecretSectionOpen)}
          isExpanded={newSecretSectionOpen}
          isIndented
        >
          <FileUpload
            id="ssh-key-modal"
            type="text"
            value={value}
            onChange={(v: string) => {
              setIsValidatedKey(validateSSHPublicKey(v));
              setValue(v?.trim());
            }}
            onReadStarted={() => setIsLoading(true)}
            onReadFinished={() => setIsLoading(false)}
            isLoading={!secretLoaded || isLoadingFile}
            allowEditingUploadedText
            isReadOnly={false}
            validated={isValidatedKey ? 'default' : 'error'}
          >
            {!isValidatedKey && (
              <HelperText>
                <HelperTextItem variant="error">{t('SSH Key is invalid')}</HelperTextItem>
              </HelperText>
            )}
          </FileUpload>

          {vmOwnSecret && (
            <Button
              variant={ButtonVariant.link}
              isDanger
              onClick={removingSecret}
              isLoading={detachingSecret}
            >
              {t('Delete secret')}
            </Button>
          )}
        </ExpandableSection>

        <ExpandableSection
          toggleText={t('Attach an existing secret')}
          data-test-id="expandable-attach-secret-section"
          onToggle={() => setNewSecretSectionOpen(!newSecretSectionOpen)}
          isExpanded={!newSecretSectionOpen}
          isIndented
        >
          <SelectSecret
            selectedSecret={selectedAttachSecret}
            onSelectSecret={setSelectedAttachSecret}
            namespace={vm?.metadata?.namespace}
          />
          {secret && !vmOwnSecret && (
            <Button
              variant={ButtonVariant.link}
              isDanger
              onClick={detachSecret}
              isLoading={detachingSecret}
            >
              {t('Detach secret')}
            </Button>
          )}
        </ExpandableSection>
        {detachingError && (
          <Alert
            variant={AlertVariant.danger}
            title={t('Error')}
            actionClose={<AlertActionCloseButton onClose={() => setDetachingError(undefined)} />}
          >
            {detachingError.message}
          </Alert>
        )}
      </div>
    </TabModal>
  );
};
