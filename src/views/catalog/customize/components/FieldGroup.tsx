import * as React from 'react';

import { TemplateParameter } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { RedExclamationCircleIcon } from '@openshift-console/dynamic-plugin-sdk/lib/app/components/status/icons';
import { FormGroup, TextInput, ValidatedOptions } from '@patternfly/react-core';

type FieldGroupProps = {
  field: TemplateParameter;
  showError?: boolean;
  className?: string;
};

export const FieldGroup: React.FC<FieldGroupProps> = ({ field, showError, className }) => {
  const { t } = useKubevirtTranslation();
  const { name, description, displayName, required, value: initialValue } = field;
  const [value, setValue] = React.useState(initialValue || '');

  const validated = showError && !value ? ValidatedOptions.error : ValidatedOptions.default;

  const fieldId = `vm-customize-${name}`;

  return (
    <FormGroup
      label={displayName || name}
      fieldId={fieldId}
      isRequired={required}
      helperText={description}
      helperTextInvalid={t('This field is required')}
      helperTextInvalidIcon={<RedExclamationCircleIcon title="Error" />}
      validated={validated}
      className={className}
    >
      <TextInput
        data-test-id={fieldId}
        isRequired={required}
        type="text"
        id={fieldId}
        name={name}
        value={value}
        onChange={(newValue) => setValue(newValue)}
        validated={validated}
      />
    </FormGroup>
  );
};
