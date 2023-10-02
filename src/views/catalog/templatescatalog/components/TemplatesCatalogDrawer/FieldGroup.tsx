import React, { FC } from 'react';
import classNames from 'classnames';

import { TemplateParameter } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { RedExclamationCircleIcon } from '@openshift-console/dynamic-plugin-sdk/lib/app/components/status/icons';
import { FormGroup, TextInput, ValidatedOptions } from '@patternfly/react-core';

type FieldGroupProps = {
  className?: string;
  field: TemplateParameter;
  onChange?: (name: string, value: string) => void;
  showError?: boolean;
};

export const FieldGroup: FC<FieldGroupProps> = ({ className, field, onChange, showError }) => {
  const { t } = useKubevirtTranslation();
  const { description, displayName, name, required, value } = field;

  const validated = showError && !value ? ValidatedOptions.error : ValidatedOptions.default;

  const fieldId = `vm-customize-${name}`;

  const onFieldChange = (newValue: string) => {
    onChange(name, newValue);
  };

  return (
    <FormGroup
      className={classNames('field-group', className)}
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
        onChange={onFieldChange}
        type="text"
        validated={validated}
        value={value}
      />
    </FormGroup>
  );
};
