import React, { FC } from 'react';
import { FieldPath, useFormContext } from 'react-hook-form';

import { DiskFormState } from '@kubevirt-utils/components/DiskModal/utils/types';
import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { OS_NAME_TYPES } from '@kubevirt-utils/resources/template';
import { isUpstream } from '@kubevirt-utils/utils/utils';
import { FormGroup, TextInput, ValidatedOptions } from '@patternfly/react-core';

import { diskSourceEphemeralFieldID } from '../../utils/constants';

import { OS_REGISTERY_LINKS } from './utils/constants';

type DiskSourceUrlInputProps = {
  fieldName: FieldPath<DiskFormState>;
  os: string;
};

const DiskSourceContainer: FC<DiskSourceUrlInputProps> = ({ fieldName, os }) => {
  const { t } = useKubevirtTranslation();
  const { getFieldState, register } = useFormContext<DiskFormState>();
  const isRHELOS = os?.includes(OS_NAME_TYPES.rhel);
  // we show feodra on upstream and rhel on downstream, and default as fedora if not exists.
  const exampleURL =
    isRHELOS && isUpstream
      ? OS_REGISTERY_LINKS.fedora
      : OS_REGISTERY_LINKS[os] || OS_REGISTERY_LINKS.fedora;

  const { error } = getFieldState(fieldName);
  return (
    <FormGroup fieldId={diskSourceEphemeralFieldID} isRequired label={t('Container')}>
      <TextInput
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
  );
};

export default DiskSourceContainer;
