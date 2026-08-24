import React, { type Dispatch, type FC, type SetStateAction, useState } from 'react';

import { type IoK8sApiCoreV1Secret } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import useActiveNamespace from '@kubevirt-utils/hooks/useActiveNamespace';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getValidNamespace, validateSSHPublicKey } from '@kubevirt-utils/utils/utils';
import {
  FileUpload,
  Form,
  FormGroup,
  HelperText,
  HelperTextItem,
  TextInput,
  ValidatedOptions,
} from '@patternfly/react-core';

import { SecretSelectionOption, type SSHSecretDetails } from '../../utils/types';
import { getSecretNameErrorMessage } from '../../utils/utils';

import './SSHKeyUpload.scss';

type SSHKeyUploadProps = {
  secrets: IoK8sApiCoreV1Secret[];
  setSSHDetails: Dispatch<SetStateAction<SSHSecretDetails>>;
  sshDetails: SSHSecretDetails;
};

const SSHKeyUpload: FC<SSHKeyUploadProps> = ({ secrets, setSSHDetails, sshDetails }) => {
  const { t } = useKubevirtTranslation();
  const activeNamespace = useActiveNamespace();
  const [nameErrorMessage, setNameErrorMessage] = useState<string>(null);
  const [isValidKey, setIsValidKey] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const vmNamespaceTarget = getValidNamespace(activeNamespace);

  const validated = !nameErrorMessage ? ValidatedOptions.default : ValidatedOptions.error;

  const onChange = (_event: unknown, sshPublicKey: string): void => {
    setIsValidKey(validateSSHPublicKey(sshPublicKey));
    setSSHDetails({
      ...sshDetails,
      secretOption: SecretSelectionOption.AddNew,
      sshPubKey: sshPublicKey?.trim(),
      sshSecretNamespace: vmNamespaceTarget,
    });
  };

  return (
    <Form isHorizontal>
      <FileUpload
        allowEditingUploadedText
        browseButtonText={t('Upload')}
        className="ssh-key-upload__file-upload"
        id="ssh-key-upload"
        isLoading={isLoading}
        isReadOnly={false}
        onClearClick={() => {
          setSSHDetails({
            ...sshDetails,
            secretOption: SecretSelectionOption.AddNew,
            sshPubKey: '',
          });
        }}
        onDataChange={onChange}
        onFileInputChange={async (_event, file: File) => {
          const fileText = await file.text();
          setIsValidKey(validateSSHPublicKey(fileText));
          setSSHDetails({
            ...sshDetails,
            secretOption: SecretSelectionOption.AddNew,
            sshPubKey: fileText?.trim(),
          });
        }}
        onReadFinished={() => setIsLoading(false)}
        onReadStarted={() => setIsLoading(true)}
        onTextChange={onChange}
        type="text"
        validated={isValidKey ? ValidatedOptions.default : ValidatedOptions.error}
        value={sshDetails?.sshPubKey}
      >
        {!isValidKey && (
          <HelperText>
            <HelperTextItem variant="error">{t('SSH key is invalid')}</HelperTextItem>
          </HelperText>
        )}
      </FileUpload>
      <FormGroup
        className="ssh-key-upload__form-group"
        fieldId="new-secret-name"
        isInline
        isRequired
        label={t('Secret name')}
      >
        <TextInput
          id="new-secret-name"
          isRequired
          name="new-secret-name"
          onChange={(_event, secretName: string) => {
            setNameErrorMessage(getSecretNameErrorMessage(secretName, vmNamespaceTarget, secrets));
            setSSHDetails({
              ...sshDetails,
              secretOption: SecretSelectionOption.AddNew,
              // secret name must be under 51 chars, or machine will fail starting.
              sshSecretName: secretName.substring(0, 51),
            });
          }}
          type="text"
          value={sshDetails?.sshSecretName}
        />
        <FormGroupHelperText validated={validated}>{nameErrorMessage}</FormGroupHelperText>
      </FormGroup>
    </Form>
  );
};

export default SSHKeyUpload;
