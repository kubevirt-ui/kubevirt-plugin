import * as React from 'react';

import { TemplateParameter } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { RedExclamationCircleIcon } from '@openshift-console/dynamic-plugin-sdk/lib/app/components/status/icons';
import { FormGroup, TextInput, ValidatedOptions } from '@patternfly/react-core';

type FieldGroupProps = {
  className?: string;
  field: TemplateParameter;
  showError?: boolean;
};

export const FieldGroup: React.FC<FieldGroupProps> = ({ className, field, showError }) => {
  const { t } = useKubevirtTranslation();
  const { description, displayName, name, required, value: initialValue } = field;
  const [value, setValue] = React.useState(initialValue || '');

  const validated = showError && !value ? ValidatedOptions.error : ValidatedOptions.default;

  const fieldId = `vm-customize-${name}`;

  return (
    <FormGroup
      className={className}
      fieldId={fieldId}
      helperText={description}
      helperTextInvalid={t('This field is required')}
      helperTextInvalidIcon={<RedExclamationCircleIcon title="Error" />}
      isRequired={required}
      label={displayName || name}
      validated={validated}
    >
      <TextInput
        data-test-id={fieldId}
        id={fieldId}
        isRequired={required}
        name={name}
        onChange={(newValue) => setValue(newValue)}
        type="text"
        validated={validated}
        value={value}
      />
    </FormGroup>
  );
};
