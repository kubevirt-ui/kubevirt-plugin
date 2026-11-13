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
  ValidatedOptions,
} from '@patternfly/react-core';

import { ADD_NEW_SSH_SECRET_NAME_MAX_LENGTH } from '../../utils/constants';
import {
  SecretSelectionOption,
  type SSHKeyUploadProps,
  type SSHSecretDetails,
} from '../../utils/types';

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
  const sshPubKeyValidated = errors.sshPubKey ? ValidatedOptions.error : ValidatedOptions.default;
  const secretNameValidated = errors.sshSecretName
    ? ValidatedOptions.error
    : ValidatedOptions.default;

  const syncAddNewFields = (updates: { sshPubKey?: string; sshSecretName?: string }): void => {
    setValue('secretOption', SecretSelectionOption.AddNew, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue('sshSecretNamespace', namespace);

    if (updates.sshPubKey !== undefined) {
      setValue('sshPubKey', updates.sshPubKey, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }

    if (updates.sshSecretName !== undefined) {
      setValue('sshSecretName', updates.sshSecretName, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
  };

  const onChange = (_event: unknown, sshPublicKey: string): void => {
    syncAddNewFields({ sshPubKey: sshPublicKey?.trim() ?? '' });
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
        onClearClick={() => syncAddNewFields({ sshPubKey: '' })}
        onDataChange={onChange}
        onFileInputChange={async (_event, file: File) => {
          const fileText = await file.text();
          syncAddNewFields({ sshPubKey: fileText?.trim() ?? '' });
        }}
        onReadFinished={() => setIsLoading(false)}
        onReadStarted={() => setIsLoading(true)}
        onTextChange={onChange}
        type="text"
        validated={sshPubKeyValidated}
        value={sshPubKey ?? ''}
      >
        {errors.sshPubKey?.message && (
          <HelperText>
            <HelperTextItem variant="error">{errors.sshPubKey.message}</HelperTextItem>
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
                  setValue('secretOption', SecretSelectionOption.AddNew, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                  setValue('sshSecretNamespace', namespace);
                }}
                type="text"
                validated={secretNameValidated}
              />
              <FormGroupHelperText validated={secretNameValidated}>
                {errors.sshSecretName?.message}
              </FormGroupHelperText>
            </>
          )}
        />
      </FormGroup>
    </Stack>
  );
};

export default SSHKeyUpload;
