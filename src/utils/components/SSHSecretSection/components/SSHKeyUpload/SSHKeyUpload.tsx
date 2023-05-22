import React, { Dispatch, FC, SetStateAction, useState } from 'react';

import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { getSecretNameErrorMessage } from '@kubevirt-utils/components/SSHSecretSection/utils/utils';
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

import { SecretSelectionOption, SSHSecretDetails } from '../../utils/types';

import './SSHKeyUpload.scss';

type SSHKeyUploadProps = {
  secrets: IoK8sApiCoreV1Secret[];
  sshDetails: SSHSecretDetails;
  setSSHDetails: Dispatch<SetStateAction<SSHSecretDetails>>;
};

const SSHKeyUpload: FC<SSHKeyUploadProps> = ({ secrets, sshDetails, setSSHDetails }) => {
  const { t } = useKubevirtTranslation();
  const [nameErrorMessage, setNameErrorMessage] = useState<string>(null);
  const [isValidKey, setIsValidKey] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <Form isHorizontal>
      <FileUpload
        id="ssh-key-upload"
        className="ssh-key-upload__file-upload"
        type="text"
        value={sshDetails?.sshPubKey}
        onChange={(sshPublicKey: string) => {
          setIsValidKey(validateSSHPublicKey(sshPublicKey));
          setSSHDetails({
            ...sshDetails,
            sshPubKey: sshPublicKey?.trim(),
            secretOption: SecretSelectionOption.addNew,
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
        isInline
        isRequired
        validated={!nameErrorMessage ? ValidatedOptions.default : ValidatedOptions.error}
        helperTextInvalid={nameErrorMessage}
      >
        <TextInput
          type="text"
          id="new-secret-name"
          name="new-secret-name"
          value={sshDetails?.sshSecretName}
          isRequired
          onChange={(secretName: string) => {
            setNameErrorMessage(getSecretNameErrorMessage(secretName, secrets));
            setSSHDetails({
              ...sshDetails,
              // secret name must be under 51 chars, or machine will fail starting.
              sshSecretName: secretName.substring(0, 51),
              secretOption: SecretSelectionOption.addNew,
            });
          }}
        />
      </FormGroup>
    </Form>
  );
};

export default SSHKeyUpload;
