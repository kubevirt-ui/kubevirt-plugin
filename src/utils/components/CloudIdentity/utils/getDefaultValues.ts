import { type CloudIdentityFormValues } from '../types/types';

type GetDefaultValuesParams = {
  initialServiceAccountName?: string;
  initialValues?: CloudIdentityFormValues;
};

const EMPTY_FORM_VALUES: CloudIdentityFormValues = {
  awsRoleArn: '',
  existingServiceAccountName: '',
  newServiceAccountName: '',
  serviceAccountSource: 'existing',
};

export const getDefaultValues = ({
  initialServiceAccountName,
  initialValues,
}: GetDefaultValuesParams): CloudIdentityFormValues => {
  return {
    ...EMPTY_FORM_VALUES,
    ...(initialServiceAccountName
      ? { existingServiceAccountName: initialServiceAccountName }
      : undefined),
    ...initialValues,
  };
};
