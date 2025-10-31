import React, { useCallback, useState } from 'react';
import CheckupImageField from 'src/views/checkups/components/CheckupImageField';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useRelatedImage from '@kubevirt-utils/hooks/useRelatedImage';
import { generatePrettyName } from '@kubevirt-utils/utils/utils';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Checkbox,
  Form,
  FormGroup,
  FormSection,
  Grid,
  GridItem,
  Popover,
  PopoverPosition,
  Switch,
  TextInput,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import {
  SELF_VALIDATION_NAME,
  selfValidationCheckupImageSettings,
  TEST_SUITE_OPTIONS,
  TEST_SUITES,
} from '../../utils';

import CheckupsSelfValidationFormActions from './CheckupsSelfValidationFormActions';

import './checkups-self-validation-form.scss';

const CheckupsSelfValidationForm = () => {
  const { t } = useKubevirtTranslation();
  const [name, setName] = useState<string>(generatePrettyName(SELF_VALIDATION_NAME));
  const [checkupImage, checkupImageLoaded, checkupImageLoadError] = useRelatedImage(
    selfValidationCheckupImageSettings,
  );
  const [selectedTestSuites, setSelectedTestSuites] = useState<string[]>(TEST_SUITES);
  const [isDryRun, setIsDryRun] = useState<boolean>(false);

  const handleTestSuiteCheck = useCallback((optionValue: string) => {
    setSelectedTestSuites((prev) => {
      const newSuites = new Set([...prev, optionValue]);
      return TEST_SUITES.filter((suite) => newSuites.has(suite));
    });
  }, []);

  const handleTestSuiteUncheck = useCallback((optionValue: string) => {
    setSelectedTestSuites((prev) => prev.filter((suite) => suite !== optionValue));
  }, []);

  return (
    <Grid>
      <GridItem span={6}>
        <Form className={'CheckupsSelfValidationForm--main'}>
          <FormSection title={t('Run self validation checkup')} titleElement="h1">
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
                onChange={(_event, value) => setName(value)}
                value={name}
              />
            </FormGroup>

            {checkupImageLoadError && (
              <CheckupImageField
                checkupImage={checkupImage}
                checkupImageLoaded={checkupImageLoaded}
                checkupImageLoadError={checkupImageLoadError}
              />
            )}

            <FormGroup fieldId="test-suites" isRequired label={t('Test suites')}>
              {TEST_SUITE_OPTIONS.map((option) => {
                const isChecked = selectedTestSuites.includes(option.value);
                return (
                  <Checkbox
                    onChange={
                      isChecked
                        ? () => handleTestSuiteUncheck(option.value)
                        : () => handleTestSuiteCheck(option.value)
                    }
                    id={`test-suite-${option.value}`}
                    isChecked={isChecked}
                    key={option.value}
                    label={option.label}
                  />
                );
              })}
            </FormGroup>

            <FormGroup
              labelHelp={
                <Popover
                  bodyContent={t(
                    'Run the validation in dry run mode (no actual tests will be executed',
                  )}
                  position={PopoverPosition.right}
                >
                  <Button icon={<HelpIcon />} variant={ButtonVariant.plain} />
                </Popover>
              }
              fieldId="dry-run"
              label={t('Dry run')}
            >
              <Switch
                id="dry-run"
                isChecked={isDryRun}
                onChange={(_event, checked) => setIsDryRun(checked)}
              />
            </FormGroup>

            <CheckupsSelfValidationFormActions
              checkupImage={checkupImage}
              isDryRun={isDryRun}
              name={name}
              selectedTestSuites={selectedTestSuites}
            />
          </FormSection>
        </Form>
      </GridItem>
    </Grid>
  );
};

export default CheckupsSelfValidationForm;
