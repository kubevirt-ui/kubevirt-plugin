// Extracted from CheckupsSelfValidationForm.tsx
// Root: src/views/checkups/self-validation/components/form/CheckupsSelfValidationForm.tsx

import React, { type FC } from 'react';
import CheckupImageField from 'src/views/checkups/components/CheckupImageField';

import CheckboxSelect from '@kubevirt-utils/components/CheckboxSelect/CheckboxSelect';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Alert,
  AlertVariant,
  FormGroup,
  type SelectProps,
  TextInput,
} from '@patternfly/react-core';

import { TEST_SUITE_OPTIONS } from '../../../utils';

type CheckupsSelfValidationFormFieldsProps = {
  checkupImage: string;
  checkupImageIsFallback: boolean;
  checkupImageLoaded: boolean;
  checkupImageLoadError: Error;
  handleTestSuiteSelect: SelectProps['onSelect'];
  name: string;
  selectedTestSuites: string[];
  setName: (name: string) => void;
  testSuitesToggleTitle: string;
};

const CheckupsSelfValidationFormFields: FC<CheckupsSelfValidationFormFieldsProps> = ({
  checkupImage,
  checkupImageIsFallback,
  checkupImageLoaded,
  checkupImageLoadError,
  handleTestSuiteSelect,
  name,
  selectedTestSuites,
  setName,
  testSuitesToggleTitle,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <Alert
        isInline
        title={t('WARNING: This checkup may put the cluster under stress')}
        variant={AlertVariant.warning}
      >
        {t(
          'This checkup can take up to 3 hours to complete. It should not be used in production environments as it may impact cluster performance.',
        )}
      </Alert>
      <FormGroup fieldId="name" isRequired label={t('Name')}>
        <TextInput
          id="name"
          isRequired
          name="name"
          onChange={(_event, value): void => setName(value)}
          value={name}
        />
      </FormGroup>
      {(checkupImageLoadError || checkupImageIsFallback) && (
        <CheckupImageField
          checkupImage={checkupImage}
          checkupImageLoaded={checkupImageLoaded}
          checkupImageLoadError={checkupImageLoadError}
          isFallback={checkupImageIsFallback}
        />
      )}
      <FormGroup fieldId="test-suites" isRequired label={t('Test suites')}>
        <CheckboxSelect
          onSelect={handleTestSuiteSelect}
          options={TEST_SUITE_OPTIONS.map((option) => ({
            children: option.label,
            isSelected: selectedTestSuites.includes(option.value),
            value: option.value,
          }))}
          selectedValues={selectedTestSuites}
          toggleTitle={testSuitesToggleTitle}
        />
      </FormGroup>
    </>
  );
};

export default CheckupsSelfValidationFormFields;
