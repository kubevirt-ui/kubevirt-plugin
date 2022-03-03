import * as React from 'react';

import { TemplateParameter } from '@kubevirt-ui/kubevirt-api/console';
import { RedExclamationCircleIcon } from '@openshift-console/dynamic-plugin-sdk/lib/app/components/status/icons';
import { FormGroup, TextInput } from '@patternfly/react-core';

type FieldGroupProps = {
  field: TemplateParameter;
  error?: string;
};

export const FieldGroup: React.FC<FieldGroupProps> = React.memo(({ field, error }) => {
  const { name, description, displayName, required, value: initialValue } = field;
  const [value, setValue] = React.useState(initialValue || '');

  const validated = error ? 'error' : 'default';

  const fieldId = `vm-customize-${name}`;

  return (
    <FormGroup
      label={displayName}
      fieldId={fieldId}
      isRequired={required}
      helperText={description}
      helperTextInvalid={error}
      helperTextInvalidIcon={<RedExclamationCircleIcon title="Error" />}
      validated={validated}
    >
      <TextInput
        isRequired={required}
        type="text"
        id={fieldId}
        name={name}
        value={value}
        onChange={setValue}
        validated={validated}
      />
    </FormGroup>
  );
});
