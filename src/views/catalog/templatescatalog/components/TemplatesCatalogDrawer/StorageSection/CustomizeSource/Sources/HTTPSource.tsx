import React, { FC, FormEventHandler } from 'react';
import { useFormContext } from 'react-hook-form';

import { FormTextInput } from '@kubevirt-utils/components/FormTextInput/FormTextInput';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { RedExclamationCircleIcon } from '@openshift-console/dynamic-plugin-sdk';
import { FormGroup, ValidatedOptions } from '@patternfly/react-core';

import { HTTP_SOURCE_NAME } from '../../constants';

type HTTPSourceProps = {
  httpSourceHelperURL: string;
  onInputValueChange: FormEventHandler<HTMLInputElement>;
  testId: string;
};

const HTTPSource: FC<HTTPSourceProps> = ({ httpSourceHelperURL, onInputValueChange, testId }) => {
  const { t } = useKubevirtTranslation();

  const {
    formState: { errors },
    register,
  } = useFormContext();

  return (
    <FormGroup
      helperText={
        httpSourceHelperURL && (
          <>
            {t('Enter URL to download. For example: ')}
            <a href={httpSourceHelperURL} rel="noreferrer" target="_blank">
              {httpSourceHelperURL}
            </a>
          </>
        )
      }
      className="disk-source-form-group"
      fieldId={`${testId}-${HTTP_SOURCE_NAME}`}
      helperTextInvalid={t('This field is required')}
      helperTextInvalidIcon={<RedExclamationCircleIcon title="Error" />}
      isRequired
      label={t('Image URL')}
      validated={errors?.[`${testId}-httpURL`] ? ValidatedOptions.error : ValidatedOptions.default}
    >
      <FormTextInput
        {...register(`${testId}-httpURL`, { required: true })}
        validated={
          errors?.[`${testId}-httpURL`] ? ValidatedOptions.error : ValidatedOptions.default
        }
        aria-label={t('Image URL')}
        data-test-id={`${testId}-http-source-input`}
        id={`${testId}-${HTTP_SOURCE_NAME}`}
        onChange={onInputValueChange}
        type="text"
      />
    </FormGroup>
  );
};

export default HTTPSource;
