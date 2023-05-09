import React, { Dispatch, FC, SetStateAction, useState } from 'react';

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

import { SSHSecretDetails } from '../../utils/types';

import './SSHKeyUpload.scss';

type SSHKeyUploadProps = {
  secrets: IoK8sApiCoreV1Secret[];
  sshCredentials: SSHSecretDetails;
  setSSHCredentials: Dispatch<SetStateAction<SSHSecretDetails>>;
};

const SSHKeyUpload: FC<SSHKeyUploadProps> = ({ secrets, sshCredentials, setSSHCredentials }) => {
  const { t } = useKubevirtTranslation();
  const [isValidName, setIsValidName] = useState<boolean>(true);
  const [isValidKey, setIsValidKey] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <Form isHorizontal>
      <FileUpload
        id={'ssh-key-upload'}
        className="ssh-key-upload__file-upload"
        type="text"
        value={sshCredentials?.sshSecretKey}
        onChange={(sshPublicKey: string) => {
          setIsValidKey(validateSSHPublicKey(sshPublicKey));
          setSSHCredentials({ ...sshCredentials, sshSecretKey: sshPublicKey?.trim() });
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
        isInline
        isRequired
        validated={isValidName ? ValidatedOptions.default : ValidatedOptions.error}
        helperTextInvalid={t('Secret name must be unique in this namespace.')}
      >
        <TextInput
          type="text"
          id="new-secret-name"
          name="new-secret-name"
          value={sshCredentials?.sshSecretName}
          isRequired
          onChange={(secretName: string) => {
            setIsValidName(validateSecretName(secretName, secrets));
            setSSHCredentials({ ...sshCredentials, sshSecretName: secretName });
          }}
        />
      </FormGroup>
    </Form>
  );
};

export default SSHKeyUpload;
