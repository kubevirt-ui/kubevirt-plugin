import React, { Dispatch, SetStateAction, useState } from 'react';

import { SSHSecretCredentials } from '@catalog/CreateFromInstanceTypes/components/VMDetailsSection/components/SSHKeySection/utils/types';
import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { validateSecretName } from '@kubevirt-utils/components/SSHSecretSection/utils/utils';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
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
  sshSecretCredentials: SSHSecretCredentials;
  setSSHSecretCredentials: Dispatch<SetStateAction<SSHSecretCredentials>>;
};

const SSHKeyUpload: React.FC<SSHKeyUploadProps> = ({
  secrets,
  sshSecretCredentials,
  setSSHSecretCredentials,
}) => {
  const { sshSecretName, sshSecretKey } = sshSecretCredentials;
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
        onChange={(v: string) => {
          setIsValidKey(validateSSHPublicKey(v));
          setSSHSecretCredentials((prevState) => ({ ...prevState, sshSecretKey: v?.trim() }));
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
          onChange={(v: string) => {
            setIsValidName(validateSecretName(v, secrets));
            setSSHSecretCredentials((prevState) => ({ ...prevState, sshSecretName: v }));
          }}
        />
      </FormGroup>
    </Form>
  );
};

export default SSHKeyUpload;
