import { type FC, useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  FileUpload,
  FormGroup,
  HelperText,
  HelperTextItem,
  Stack,
  TextInput,
} from '@patternfly/react-core';

import { ADD_NEW_SSH_SECRET_NAME_MAX_LENGTH } from '../../utils/constants';
import {
  ensureAddNewSSHSecretContext,
  getFormFieldErrorMessage,
  getValidatedOptionsFromFieldError,
  SSH_SECRET_TOUCH_VALIDATE_SET_VALUE_OPTIONS,
} from '../../utils/sshSecretFormHelpers';
import { type SSHKeyUploadProps, type SSHSecretDetails } from '../../utils/types';

import './SSHKeyUpload.scss';

const SSHKeyUpload: FC<SSHKeyUploadProps> = ({ namespace }) => {
  const { t } = useKubevirtTranslation();
  const {
    control,
    formState: { errors },
    setValue,
  } = useFormContext<SSHSecretDetails>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const sshPubKey = useWatch({ control, name: 'sshPubKey' });
  const sshPubKeyValidated = getValidatedOptionsFromFieldError(errors.sshPubKey);
  const sshPubKeyError = getFormFieldErrorMessage(errors.sshPubKey);
  const secretNameValidated = getValidatedOptionsFromFieldError(errors.sshSecretName);
  const secretNameError = getFormFieldErrorMessage(errors.sshSecretName);

  const setSshPubKey = (sshPubKeyValue: string): void => {
    ensureAddNewSSHSecretContext(setValue, namespace);
    setValue('sshPubKey', sshPubKeyValue, SSH_SECRET_TOUCH_VALIDATE_SET_VALUE_OPTIONS);
  };

  const onChange = (_event: unknown, sshPublicKey: string): void => {
    setSshPubKey(sshPublicKey?.trim() ?? '');
  };

  return (
    <Stack hasGutter>
      <FileUpload
        allowEditingUploadedText
        browseButtonText={t('Upload')}
        className="ssh-key-upload__file-upload"
        id="ssh-key-upload"
        isLoading={isLoading}
        isReadOnly={false}
        onClearClick={() => setSshPubKey('')}
        onDataChange={onChange}
        onFileInputChange={async (_event, file: File) => {
          const fileText = await file.text();
          setSshPubKey(fileText?.trim() ?? '');
        }}
        onReadFinished={() => setIsLoading(false)}
        onReadStarted={() => setIsLoading(true)}
        onTextChange={onChange}
        type="text"
        validated={sshPubKeyValidated}
        value={sshPubKey ?? ''}
      >
        {sshPubKeyError && (
          <HelperText>
            <HelperTextItem variant="error">{sshPubKeyError}</HelperTextItem>
          </HelperText>
        )}
      </FileUpload>
      <FormGroup
        className="ssh-key-upload__form-group"
        fieldId="ssh-add-new-secret-name"
        isInline
        isRequired
        label={t('Secret name')}
      >
        <Controller
          control={control}
          name="sshSecretName"
          render={({ field }) => (
            <>
              <TextInput
                {...field}
                id="ssh-add-new-secret-name"
                isRequired
                name="new-secret-name"
                onChange={(_event, secretName: string) => {
                  field.onChange(secretName.substring(0, ADD_NEW_SSH_SECRET_NAME_MAX_LENGTH));
                  ensureAddNewSSHSecretContext(setValue, namespace);
                }}
                type="text"
                validated={secretNameValidated}
              />
              <FormGroupHelperText validated={secretNameValidated}>
                {secretNameError}
              </FormGroupHelperText>
            </>
          )}
        />
      </FormGroup>
    </Stack>
  );
};

export default SSHKeyUpload;
