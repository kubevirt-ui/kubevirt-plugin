import React, { useCallback, useEffect, useMemo, useState } from 'react';
import CheckupImageField from 'src/views/checkups/components/CheckupImageField';

import { IoK8sApiStorageV1StorageClass } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import CheckboxSelect from '@kubevirt-utils/components/CheckboxSelect/CheckboxSelect';
import ClusterProjectDropdown from '@kubevirt-utils/components/ClusterProjectDropdown/ClusterProjectDropdown';
import { getDefaultStorageClass } from '@kubevirt-utils/components/DiskModal/components/StorageClassAndPreallocation/utils/helpers';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useRelatedImage from '@kubevirt-utils/hooks/useRelatedImage';
import { modelToGroupVersionKind, StorageClassModel } from '@kubevirt-utils/models';
import { generatePrettyName, isEmpty } from '@kubevirt-utils/utils/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import {
  Alert,
  AlertVariant,
  Form,
  FormGroup,
  FormSection,
  Grid,
  GridItem,
  SelectProps,
  TextInput,
} from '@patternfly/react-core';

import {
  SELF_VALIDATION_NAME,
  selfValidationCheckupImageSettings,
  TEST_SUITE_OPTIONS,
  TEST_SUITES,
} from '../../utils';
import { calculatePVCStorageSize } from '../../utils/selfValidationJob/resourceTemplates';

import AdvancedSettings from './AdvancedSettings';
import CheckupsSelfValidationFormActions from './CheckupsSelfValidationFormActions';

import './checkups-self-validation-form.scss';

const CheckupsSelfValidationForm = () => {
  const { t } = useKubevirtTranslation();
  const cluster = useClusterParam();
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

  const [storageClasses, storageClassesLoaded] = useK8sWatchData<IoK8sApiStorageV1StorageClass[]>({
    cluster,
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
    <>
      <ClusterProjectDropdown includeAllClusters={false} includeAllProjects={false} />
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
              <AdvancedSettings
                defaultSC={defaultSC}
                handleStorageCapabilitySelect={handleStorageCapabilitySelect}
                isDryRun={isDryRun}
                pvcSize={pvcSize}
                setIsDryRun={setIsDryRun}
                setPvcSize={setPvcSize}
                setStorageClass={setStorageClass}
                setTestSkips={setTestSkips}
                storageCapabilities={storageCapabilities}
                storageClass={storageClass}
                storageClasses={storageClasses}
                storageClassesLoaded={storageClassesLoaded}
                testSkips={testSkips}
              />

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
    </>
  );
};

export default CheckupsSelfValidationForm;
