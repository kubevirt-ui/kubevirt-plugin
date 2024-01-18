import React, { Dispatch, FC, SetStateAction, useState } from 'react';

import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { getSecretNameErrorMessage } from '@kubevirt-utils/components/SSHSecretSection/utils/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getValidNamespace, validateSSHPublicKey } from '@kubevirt-utils/utils/utils';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
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
  setSSHDetails: Dispatch<SetStateAction<SSHSecretDetails>>;
  sshDetails: SSHSecretDetails;
};

const SSHKeyUpload: FC<SSHKeyUploadProps> = ({ secrets, setSSHDetails, sshDetails }) => {
  const { t } = useKubevirtTranslation();
  const [activeNamespace] = useActiveNamespace();
  const [nameErrorMessage, setNameErrorMessage] = useState<string>(null);
  const [isValidKey, setIsValidKey] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const vmNamespaceTarget = getValidNamespace(activeNamespace);

  return (
    <Form isHorizontal>
      <FileUpload
        onChange={(sshPublicKey: string) => {
          setIsValidKey(validateSSHPublicKey(sshPublicKey));
          setSSHDetails({
            ...sshDetails,
            secretOption: SecretSelectionOption.addNew,
            sshPubKey: sshPublicKey?.trim(),
          });
        }}
        allowEditingUploadedText
        className="ssh-key-upload__file-upload"
        id="ssh-key-upload"
        isLoading={isLoading}
        isReadOnly={false}
        onReadFinished={() => setIsLoading(false)}
        onReadStarted={() => setIsLoading(true)}
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
        helperTextInvalid={nameErrorMessage}
        isInline
        isRequired
        label={t('Secret name')}
        validated={!nameErrorMessage ? ValidatedOptions.default : ValidatedOptions.error}
      >
        <TextInput
          onChange={(secretName: string) => {
            setNameErrorMessage(getSecretNameErrorMessage(secretName, vmNamespaceTarget, secrets));
            setSSHDetails({
              ...sshDetails,
              secretOption: SecretSelectionOption.addNew,
              // secret name must be under 51 chars, or machine will fail starting.
              sshSecretName: secretName.substring(0, 51),
            });
          }}
          id="new-secret-name"
          isRequired
          name="new-secret-name"
          type="text"
          value={sshDetails?.sshSecretName}
        />
      </FormGroup>
    </Form>
  );
};

export default SSHKeyUpload;
