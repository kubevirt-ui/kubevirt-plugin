import { type FC } from 'react';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { FormTextInput } from '@kubevirt-utils/components/FormTextInput/FormTextInput';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, ValidatedOptions } from '@patternfly/react-core';

import useFormContext from '../hooks/useFormContext';

const AWSFields: FC = () => {
  const { t } = useKubevirtTranslation();
  const {
    formState: { errors },
    register,
  } = useFormContext();

  return (
    <FormGroup fieldId="cloud-identity-aws-role-arn" isRequired label={t('Role ARN')}>
      <FormTextInput
        {...register('awsRoleArn')}
        id="cloud-identity-aws-role-arn"
        isRequired
        type="text"
        validated={errors.awsRoleArn ? ValidatedOptions.error : ValidatedOptions.default}
      />
      <FormGroupHelperText validated={errors.awsRoleArn ? ValidatedOptions.error : undefined}>
        {errors.awsRoleArn?.message}
      </FormGroupHelperText>
    </FormGroup>
  );
};

export default AWSFields;
