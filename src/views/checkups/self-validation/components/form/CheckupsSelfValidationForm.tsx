import React, { useCallback, useEffect, useMemo, useState } from 'react';
import CheckupImageField from 'src/views/checkups/components/CheckupImageField';

import { IoK8sApiStorageV1StorageClass } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import CheckboxSelect from '@kubevirt-utils/components/CheckboxSelect/CheckboxSelect';
import ClusterProjectDropdown from '@kubevirt-utils/components/ClusterProjectDropdown/ClusterProjectDropdown';
import { getDefaultStorageClass } from '@kubevirt-utils/components/DiskModal/components/StorageClassAndPreallocation/utils/helpers';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useRelatedImage from '@kubevirt-utils/hooks/useRelatedImage';
import useStorageProfileClaimPropertySets from '@kubevirt-utils/hooks/useStorageProfileClaimPropertySets';
import { modelToGroupVersionKind, StorageClassModel } from '@kubevirt-utils/models';
import { getName } from '@kubevirt-utils/resources/shared';
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
import useStorageProfileCapabilitiesSync from './useStorageProfileCapabilitiesSync';
import {
  addStorageCapability,
  addTestSuite,
  getTestSuitesToggleTitle,
  removeStorageCapability,
  removeTestSuite,
} from './utils';

import './checkups-self-validation-form.scss';

const CheckupsSelfValidationForm = () => {
  const { t } = useKubevirtTranslation();
  const cluster = useClusterParam();
  const [name, setName] = useState<string>(generatePrettyName(SELF_VALIDATION_NAME));
  const [checkupImage, checkupImageLoaded, checkupImageLoadError, checkupImageIsFallback] =
    useRelatedImage(selfValidationCheckupImageSettings);
  const [selectedTestSuites, setSelectedTestSuites] = useState<string[]>(TEST_SUITES);
  const [isDryRun, setIsDryRun] = useState<boolean>(false);
  const [storageClass, setStorageClass] = useState<string>('');
  const [testSkips, setTestSkips] = useState<string>('');
  const [storageCapabilities, setStorageCapabilities] = useState<string[]>([]);

  const defaultPvcSize = useMemo(
    () => calculatePVCStorageSize(selectedTestSuites),
    [selectedTestSuites],
  );
  const [pvcSize, setPvcSize] = useState<string>(defaultPvcSize);

  useEffect(() => {
    setPvcSize(defaultPvcSize);
  }, [defaultPvcSize]);

  const [storageClasses, storageClassesLoaded] = useK8sWatchData<IoK8sApiStorageV1StorageClass[]>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(StorageClassModel),
    isList: true,
  });

  const defaultSC = useMemo(() => getDefaultStorageClass(storageClasses), [storageClasses]);
  const effectiveStorageClass = storageClass || getName(defaultSC) || '';

  const {
    claimPropertySets,
    error: storageProfileError,
    loaded: storageProfileLoaded,
  } = useStorageProfileClaimPropertySets(effectiveStorageClass, cluster);

  useStorageProfileCapabilitiesSync(
    effectiveStorageClass,
    claimPropertySets,
    storageProfileLoaded,
    setStorageCapabilities,
  );

  useEffect(() => {
    if (!storageClass && storageClassesLoaded && !isEmpty(defaultSC)) {
      setStorageClass(getName(defaultSC));
    }
  }, [defaultSC, storageClass, storageClassesLoaded]);

  const handleStorageCapabilitySelect: SelectProps['onSelect'] = useCallback(
    (_event, value: string) => {
      setStorageCapabilities((prev) =>
        prev.includes(value)
          ? removeStorageCapability(prev, value)
          : addStorageCapability(prev, value),
      );
    },
    [],
  );

  const handleTestSuiteSelect: SelectProps['onSelect'] = useCallback((_event, value: string) => {
    setSelectedTestSuites((prev) =>
      prev.includes(value) ? removeTestSuite(prev, value) : addTestSuite(prev, value),
    );
  }, []);

  const testSuitesToggleTitle = useMemo(
    () => getTestSuitesToggleTitle(selectedTestSuites, t),
    [selectedTestSuites, t],
  );

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
                effectiveStorageClassName={effectiveStorageClass}
                handleStorageCapabilitySelect={handleStorageCapabilitySelect}
                isDryRun={isDryRun}
                pvcSize={pvcSize}
                setIsDryRun={setIsDryRun}
                setPvcSize={setPvcSize}
                setStorageClass={setStorageClass}
                setTestSkips={setTestSkips}
                storageCapabilities={storageCapabilities}
                storageClasses={storageClasses}
                storageClassesLoaded={storageClassesLoaded}
                storageProfileError={Boolean(storageProfileError)}
                storageProfileHasClaimPropertySets={Boolean(claimPropertySets?.length)}
                storageProfileLoaded={storageProfileLoaded}
                testSkips={testSkips}
              />

              <CheckupsSelfValidationFormActions
                checkupImage={checkupImage}
                isDryRun={isDryRun}
                name={name}
                pvcSize={pvcSize}
                selectedTestSuites={selectedTestSuites}
                storageCapabilities={storageCapabilities}
                storageClass={effectiveStorageClass}
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
