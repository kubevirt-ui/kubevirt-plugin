import React, { FC } from 'react';
import { useFormContext } from 'react-hook-form';

import { DiskFormState } from '@kubevirt-utils/components/DiskModal/utils/types';
import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, TextInput, ValidatedOptions } from '@patternfly/react-core';

import { diskSourceURLFieldID, urlField } from '../../utils/constants';

import { HTTP_URL_PREFIX, HTTPS_URL_PREFIX } from './utils/constants';
import { DiskSourceUrlInputProps } from './utils/types';
import URLSourceHelperText from './URLSourceHelperText';

const DiskSourceUrlInput: FC<DiskSourceUrlInputProps> = ({ os }) => {
  const { t } = useKubevirtTranslation();
  const {
    formState: { errors },
    register,
  } = useFormContext<DiskFormState>();

  const error = errors?.http?.url;

  return (
    <FormGroup
      data-test-id={diskSourceURLFieldID}
      fieldId={diskSourceURLFieldID}
      isRequired
      label={t('URL')}
    >
      <TextInput
        data-test-id={diskSourceURLFieldID}
        id={diskSourceURLFieldID}
        {...register(urlField, {
          required: t('URL is required'),
          shouldUnregister: true,
          validate: (value: string) =>
            value?.startsWith(HTTP_URL_PREFIX) ||
            value?.startsWith(HTTPS_URL_PREFIX) ||
            t('A valid URL should start with "http://" OR "https://" .'),
        })}
      />
      <FormGroupHelperText validated={error ? ValidatedOptions.error : ValidatedOptions.default}>
        {error ? error?.message : <URLSourceHelperText os={os} />}
      </FormGroupHelperText>
    </FormGroup>
  );
};

export default DiskSourceUrlInput;
