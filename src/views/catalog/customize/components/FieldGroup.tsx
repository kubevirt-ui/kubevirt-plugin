import * as React from 'react';

import { TemplateParameter } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { RedExclamationCircleIcon } from '@openshift-console/dynamic-plugin-sdk/lib/app/components/status/icons';
import { FormGroup, TextInput } from '@patternfly/react-core';

type FieldGroupProps = {
  field: TemplateParameter;
  showError?: boolean;
};

export const FieldGroup: React.FC<FieldGroupProps> = ({ field, showError }) => {
  const { t } = useKubevirtTranslation();
  const { name, description, displayName, required, value: initialValue } = field;
  const [value, setValue] = React.useState(initialValue || '');

  const validated = showError && !value ? 'error' : 'default';

  return (
    <FormGroup
      label={displayName}
      fieldId={`customize-required-${name}`}
      isRequired={required}
      helperText={description}
      helperTextInvalid={t('This field is required')}
      helperTextInvalidIcon={<RedExclamationCircleIcon title="Error" />}
      validated={validated}
    >
      <TextInput
        isRequired={required}
        type="text"
        id={name}
        name={name}
        value={value}
        onChange={(newValue) => setValue(newValue)}
        validated={validated}
      />
    </FormGroup>
  );
};
