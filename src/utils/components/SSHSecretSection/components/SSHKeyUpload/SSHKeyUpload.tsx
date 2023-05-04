import React, { FC, useState } from 'react';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import { instanceTypeActionType } from '@catalog/CreateFromInstanceTypes/state/utils/types';
import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { validateSecretName } from '@kubevirt-utils/components/SSHSecretSection/utils/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { validateSSHPublicKey } from '@kubevirt-utils/utils/utils';
import {
  FileUpload,
  Form,
  FormGroup,
  HelperText,
  HelperTextItem,
  TextInput,
  ValidatedOptions,
} from '@patternfly/react-core';

import './SSHKeyUpload.scss';

type SSHKeyUploadProps = {
  secrets: IoK8sApiCoreV1Secret[];
};

const SSHKeyUpload: FC<SSHKeyUploadProps> = ({ secrets }) => {
  const { t } = useKubevirtTranslation();
  const { instanceTypeVMState, setInstanceTypeVMState } = useInstanceTypeVMStore();
  const { sshSecretCredentials } = instanceTypeVMState;
  const { sshSecretKey, sshSecretName } = sshSecretCredentials;
  const [isValidName, setIsValidName] = useState<boolean>(true);
  const [isValidKey, setIsValidKey] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <Form isHorizontal>
      <FileUpload
        id={'ssh-key-upload'}
        className="ssh-key-upload__file-upload"
        type="text"
        value={sshSecretKey}
        onChange={(sshPublicKey: string) => {
          setIsValidKey(validateSSHPublicKey(sshPublicKey));
          setInstanceTypeVMState({
            type: instanceTypeActionType.setSSHCredentials,
            payload: { ...sshSecretCredentials, sshSecretKey: sshPublicKey?.trim() },
          });
        }}
        onReadStarted={() => setIsLoading(true)}
        onReadFinished={() => setIsLoading(false)}
        isLoading={isLoading}
        allowEditingUploadedText
        isReadOnly={false}
        validated={isValidKey ? ValidatedOptions.default : ValidatedOptions.error}
      >
        {!isValidKey && (
          <HelperText>
            <HelperTextItem variant="error">{t('SSH key is invalid')}</HelperTextItem>
          </HelperText>
        )}
      </FileUpload>
      <FormGroup
        className="ssh-key-upload__form-group"
        label={t('Secret name')}
        fieldId="new-secret-name"
        isRequired
        validated={isValidName ? ValidatedOptions.default : ValidatedOptions.error}
        helperTextInvalid={t('Secret name must be unique in this namespace.')}
      >
        <TextInput
          type="text"
          id="new-secret-name"
          name="new-secret-name"
          value={sshSecretName}
          isRequired
          onChange={(secretName: string) => {
            setIsValidName(validateSecretName(secretName, secrets));
            setInstanceTypeVMState({
              type: instanceTypeActionType.setSSHCredentials,
              payload: { ...sshSecretCredentials, sshSecretName: secretName },
            });
          }}
        />
      </FormGroup>
    </Form>
  );
};

export default SSHKeyUpload;
