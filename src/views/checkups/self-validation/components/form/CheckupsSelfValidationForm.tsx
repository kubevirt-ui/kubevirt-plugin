import React, { useCallback, useEffect, useMemo, useState } from 'react';
import CheckupImageField from 'src/views/checkups/components/CheckupImageField';

import { IoK8sApiStorageV1StorageClass } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import {
  getDefaultStorageClass,
  getSCSelectOptions,
} from '@kubevirt-utils/components/DiskModal/components/StorageClassAndPreallocation/utils/helpers';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useRelatedImage from '@kubevirt-utils/hooks/useRelatedImage';
import { modelToGroupVersionKind, StorageClassModel } from '@kubevirt-utils/models';
import { generatePrettyName, isEmpty } from '@kubevirt-utils/utils/utils';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Checkbox,
  ExpandableSection,
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
  STORAGE_CAPABILITY_OPTIONS,
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
  const [storageClass, setStorageClass] = useState<string>('');
  const [testSkips, setTestSkips] = useState<string>('');
  const [storageCapabilities, setStorageCapabilities] = useState<string[]>([]);

  const [storageClasses, storageClassesLoaded] = useK8sWatchResource<
    IoK8sApiStorageV1StorageClass[]
  >({
    groupVersionKind: modelToGroupVersionKind(StorageClassModel),
    isList: true,
  });

  const defaultSC = useMemo(() => getDefaultStorageClass(storageClasses), [storageClasses]);

  useEffect(() => {
    if (!storageClass && storageClassesLoaded && !isEmpty(defaultSC)) {
      setStorageClass(defaultSC?.metadata?.name);
    }
  }, [defaultSC, storageClass, storageClassesLoaded]);

  const handleTestSuiteCheck = useCallback((optionValue: string) => {
    setSelectedTestSuites((prev) => {
      const newSuites = new Set([...prev, optionValue]);
      return TEST_SUITES.filter((suite) => newSuites.has(suite));
    });
  }, []);

  const handleTestSuiteUncheck = useCallback((optionValue: string) => {
    setSelectedTestSuites((prev) => prev.filter((suite) => suite !== optionValue));
  }, []);

  const handleStorageCapabilityCheck = useCallback((optionValue: string) => {
    setStorageCapabilities((prev) => {
      const newCapabilities = new Set([...prev, optionValue]);
      return Array.from(newCapabilities);
    });
  }, []);

  const handleStorageCapabilityUncheck = useCallback((optionValue: string) => {
    setStorageCapabilities((prev) => prev.filter((capability) => capability !== optionValue));
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
            <ExpandableSection isIndented toggleText={t('Advanced settings')}>
              <FormGroup
                className="form-group-spacing"
                fieldId="storage-class"
                label={t('Storage class')}
              >
                {storageClassesLoaded ? (
                  <InlineFilterSelect
                    toggleProps={{
                      isFullWidth: true,
                      placeholder: t('Select {{label}}', { label: StorageClassModel.label }),
                    }}
                    options={getSCSelectOptions(storageClasses)}
                    popperProps={{ enableFlip: true }}
                    selected={storageClass || defaultSC?.metadata?.name || ''}
                    setSelected={setStorageClass}
                  />
                ) : (
                  <Loading />
                )}
              </FormGroup>
              <FormGroup
                className="form-group-spacing"
                fieldId="test-skips"
                label={t('Test skips')}
              >
                <TextInput
                  placeholder={t(
                    'Pipe-separated list of tests to skip (e.g., test_id:1783|test_id:1853)',
                  )}
                  id="test-skips"
                  name="test-skips"
                  onChange={(_event, value) => setTestSkips(value)}
                  value={testSkips}
                />
              </FormGroup>
              <FormGroup
                className="form-group-spacing"
                fieldId="storage-capabilities"
                label={t('Storage capabilities')}
              >
                {STORAGE_CAPABILITY_OPTIONS.map((option) => {
                  const isChecked = storageCapabilities.includes(option.value);
                  return (
                    <Checkbox
                      onChange={
                        isChecked
                          ? () => handleStorageCapabilityUncheck(option.value)
                          : () => handleStorageCapabilityCheck(option.value)
                      }
                      id={`storage-capability-${option.value}`}
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
            </ExpandableSection>

            <CheckupsSelfValidationFormActions
              checkupImage={checkupImage}
              isDryRun={isDryRun}
              name={name}
              selectedTestSuites={selectedTestSuites}
              storageCapabilities={storageCapabilities}
              storageClass={storageClass || defaultSC?.metadata?.name}
              testSkips={testSkips}
            />
          </FormSection>
        </Form>
      </GridItem>
    </Grid>
  );
};

export default CheckupsSelfValidationForm;
