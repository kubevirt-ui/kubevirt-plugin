import React, { FC } from 'react';
import classNames from 'classnames';

import { TemplateParameter } from '@kubevirt-ui/kubevirt-api/console';
import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
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
      isRequired={required}
      label={displayName || name}
    >
      <TextInput
        data-test-id={fieldId}
        id={fieldId}
        isRequired={required}
        name={name}
        onChange={(_event, newValue: string) => onFieldChange(newValue)}
        type="text"
        validated={validated}
        value={value}
      />
      <FormGroupHelperText validated={validated}>
        {showError && !value ? t('This field is required') : description}
      </FormGroupHelperText>
    </FormGroup>
  );
};
