import React, { FC } from 'react';
import { FieldPath, useFormContext } from 'react-hook-form';

import { V1DiskFormState } from '@kubevirt-utils/components/DiskModal/utils/types';
import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { FormPasswordInput } from '@kubevirt-utils/components/FormPasswordInput/FormPasswordInput';
import { FormTextInput } from '@kubevirt-utils/components/FormTextInput/FormTextInput';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { OS_NAME_TYPES } from '@kubevirt-utils/resources/template';
import { isUpstream } from '@kubevirt-utils/utils/utils';
import { FormGroup, ValidatedOptions } from '@patternfly/react-core';

import { REGISTRY_PASSWORD_FIELD, REGISTRY_USERNAME_FIELD } from '../../../utils/constants';
import {
  diskSourceEphemeralFieldID,
  diskSourcePasswordFieldID,
  diskSourceUsernameFieldID,
} from '../../utils/constants';

import { OS_REGISTERY_LINKS } from './utils/constants';

type DiskSourceUrlInputProps = {
  fieldName: FieldPath<V1DiskFormState>;
  isEphemeralDiskSource?: boolean;
  os: string;
};

const DiskSourceContainer: FC<DiskSourceUrlInputProps> = ({
  fieldName,
  isEphemeralDiskSource = false,
  os,
}) => {
  const { t } = useKubevirtTranslation();
  const {
    formState: { errors },
    getFieldState,
    register,
  } = useFormContext<V1DiskFormState>();

  const isRHELOS = os?.includes(OS_NAME_TYPES.rhel);
  // we show fedora on upstream and rhel on downstream, and default as fedora if not exists.
  const exampleURL =
    isRHELOS && isUpstream
      ? OS_REGISTERY_LINKS.fedora
      : OS_REGISTERY_LINKS[os] || OS_REGISTERY_LINKS.fedora;

  const { error } = getFieldState(fieldName);

  return (
    <>
      <FormGroup fieldId={diskSourceEphemeralFieldID} isRequired label={t('Container')}>
        <FormTextInput
          data-test-id={diskSourceEphemeralFieldID}
          id={diskSourceEphemeralFieldID}
          {...register(fieldName, { required: t('Container is required.') })}
        />
        <FormGroupHelperText validated={error ? ValidatedOptions.error : ValidatedOptions.default}>
          {error ? (
            error?.message
          ) : (
            <>
              {t('Example: ')}
              {exampleURL}
            </>
          )}
        </FormGroupHelperText>
      </FormGroup>
      {!isEphemeralDiskSource && (
        <>
          <FormGroup
            className="disk-source-form-group"
            fieldId={diskSourceUsernameFieldID}
            label={t('Username')}
          >
            <FormTextInput
              {...register(REGISTRY_USERNAME_FIELD)}
              validated={
                errors?.[REGISTRY_USERNAME_FIELD]
                  ? ValidatedOptions.error
                  : ValidatedOptions.default
              }
              aria-label={t('Username')}
              data-test-id={diskSourceUsernameFieldID}
              id={diskSourceUsernameFieldID}
              type="text"
            />
          </FormGroup>
          <FormGroup
            className="disk-source-form-group"
            fieldId={diskSourcePasswordFieldID}
            label={t('Password')}
          >
            <FormPasswordInput
              {...register(REGISTRY_PASSWORD_FIELD)}
              validated={
                errors?.[REGISTRY_PASSWORD_FIELD]
                  ? ValidatedOptions.error
                  : ValidatedOptions.default
              }
              aria-label={t('Password')}
              data-test-id={diskSourcePasswordFieldID}
              id={diskSourcePasswordFieldID}
              type="text"
            />
          </FormGroup>
        </>
      )}
    </>
  );
};

export default DiskSourceContainer;
