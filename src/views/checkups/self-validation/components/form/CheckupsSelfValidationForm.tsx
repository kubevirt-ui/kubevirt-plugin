import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Trans } from 'react-i18next';
import CheckupImageField from 'src/views/checkups/components/CheckupImageField';

import { IoK8sApiStorageV1StorageClass } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import CapacityInput from '@kubevirt-utils/components/CapacityInput/CapacityInput';
import CheckboxSelect from '@kubevirt-utils/components/CheckboxSelect/CheckboxSelect';
import {
  getDefaultStorageClass,
  getSCSelectOptions,
} from '@kubevirt-utils/components/DiskModal/components/StorageClassAndPreallocation/utils/helpers';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
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
  ExpandableSection,
  Form,
  FormGroup,
  FormSection,
  Grid,
  GridItem,
  Popover,
  PopoverPosition,
  SelectProps,
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
import { calculatePVCStorageSize } from '../../utils/selfValidationJob/resourceTemplates';

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

  // Calculate default PVC size based on selected test suites
  const defaultPvcSize = useMemo(
    () => calculatePVCStorageSize(selectedTestSuites),
    [selectedTestSuites],
  );
  const [pvcSize, setPvcSize] = useState<string>(defaultPvcSize);

  // Update PVC size when test suites change
  useEffect(() => {
    setPvcSize(defaultPvcSize);
  }, [defaultPvcSize]);

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

  const handleStorageCapabilitySelect: SelectProps['onSelect'] = useCallback(
    (_event, value: string) => {
      if (storageCapabilities.includes(value)) {
        handleStorageCapabilityUncheck(value);
      } else {
        handleStorageCapabilityCheck(value);
      }
    },
    [storageCapabilities, handleStorageCapabilityCheck, handleStorageCapabilityUncheck],
  );

  const handleTestSuiteSelect: SelectProps['onSelect'] = useCallback(
    (_event, value: string) => {
      if (selectedTestSuites.includes(value)) {
        handleTestSuiteUncheck(value);
      } else {
        handleTestSuiteCheck(value);
      }
    },
    [selectedTestSuites, handleTestSuiteCheck, handleTestSuiteUncheck],
  );

  const testSuitesToggleTitle = useMemo(() => {
    if (selectedTestSuites.length === TEST_SUITES.length) {
      return t('All');
    }
    return t('Test suites');
  }, [selectedTestSuites, t]);

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
              <CheckboxSelect
                options={TEST_SUITE_OPTIONS.map((option) => ({
                  children: option.label,
                  isSelected: selectedTestSuites.includes(option.value),
                  value: option.value,
                }))}
                onSelect={handleTestSuiteSelect}
                selectedValues={selectedTestSuites}
                toggleTitle={testSuitesToggleTitle}
              />
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
              <FormGroup className="form-group-spacing" fieldId="pvc-size" label={t('PVC size')}>
                <CapacityInput onChange={setPvcSize} size={pvcSize} />
              </FormGroup>
              <FormGroup
                labelHelp={
                  <Popover
                    bodyContent={
                      <Trans ns="plugin__kubevirt-plugin" t={t}>
                        Select the storage capabilities your storage class supports. Check the{' '}
                        <a
                          href={documentationURL.STORAGE_PROFILES}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          StorageProfile
                        </a>{' '}
                        to see supported access and volume modes. Note: Storage Snapshot must be
                        selected for snapshot tests to run.
                      </Trans>
                    }
                    position={PopoverPosition.right}
                  >
                    <Button hasNoPadding icon={<HelpIcon />} variant={ButtonVariant.plain} />
                  </Popover>
                }
                className="form-group-spacing storage-capabilities"
                fieldId="storage-capabilities"
                label={t('Storage capabilities')}
              >
                <CheckboxSelect
                  options={STORAGE_CAPABILITY_OPTIONS.map((option) => ({
                    children: option.label,
                    isSelected: storageCapabilities.includes(option.value),
                    value: option.value,
                  }))}
                  onSelect={handleStorageCapabilitySelect}
                  selectedValues={storageCapabilities}
                  toggleTitle={t('Storage capabilities')}
                />
              </FormGroup>
              <Switch
                label={
                  <>
                    <span className="pf-v6-c-form__label-text">{t('Dry run')}</span>
                    <Popover
                      bodyContent={t(
                        'Run the validation in dry run mode (no actual tests will be executed)',
                      )}
                      position={PopoverPosition.right}
                    >
                      <Button icon={<HelpIcon />} variant={ButtonVariant.plain} />
                    </Popover>
                  </>
                }
                id="dry-run"
                isChecked={isDryRun}
                isReversed={true}
                onChange={(_event, checked) => setIsDryRun(checked)}
              />
            </ExpandableSection>

            <CheckupsSelfValidationFormActions
              checkupImage={checkupImage}
              isDryRun={isDryRun}
              name={name}
              pvcSize={pvcSize}
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
