import React, { type ReactElement } from 'react';
import CheckupImageField from 'src/views/checkups/components/CheckupImageField';

import CheckboxSelect from '@kubevirt-utils/components/CheckboxSelect/CheckboxSelect';
import ClusterProjectDropdown from '@kubevirt-utils/components/ClusterProjectDropdown/ClusterProjectDropdown';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Alert,
  AlertVariant,
  Form,
  FormGroup,
  FormSection,
  Grid,
  GridItem,
  Stack,
  TextInput,
} from '@patternfly/react-core';

import { TEST_SUITE_OPTIONS } from '../../utils';
import AdvancedSettings from './AdvancedSettings';
import CheckupsSelfValidationFormActions from './CheckupsSelfValidationFormActions';
import useCheckupsSelfValidationFormState from './useCheckupsSelfValidationFormState';
import WindowsValidationSettings from './WindowsValidationSettings';

import './checkups-self-validation-form.scss';

const CheckupsSelfValidationForm = (): ReactElement => {
  const { t } = useKubevirtTranslation();
  const {
    checkupImage,
    checkupImageIsFallback,
    checkupImageLoaded,
    checkupImageLoadError,
    claimPropertySets,
    effectiveStorageClass,
    handleStorageCapabilitySelect,
    handleTestSuiteSelect,
    isDryRun,
    name,
    pipelinesInstalled,
    pipelinesLoaded,
    pvcSize,
    selectedTestSuites,
    setIsDryRun,
    setName,
    setPvcSize,
    setStorageClass,
    setTestSkips,
    storageCapabilities,
    storageClasses,
    storageClassesLoaded,
    storageProfileError,
    storageProfileLoaded,
    testSkips,
    testSuitesToggleTitle,
    windowsState,
  } = useCheckupsSelfValidationFormState(t);

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

              {(checkupImageLoadError ?? checkupImageIsFallback) && (
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
              <Stack hasGutter>
                <WindowsValidationSettings
                  isEulaConfirmed={windowsState.isEulaConfirmed}
                  isTier2Selected={windowsState.isTier2Selected}
                  pipelinesInstalled={pipelinesInstalled}
                  pipelinesLoaded={pipelinesLoaded}
                  setIsEulaConfirmed={windowsState.setIsEulaConfirmed}
                  setWindowsServerTesting={windowsState.setWindowsServerTesting}
                  setWinImageDownloadUrl={windowsState.setWinImageDownloadUrl}
                  windowsServerTesting={windowsState.windowsServerTesting}
                  winImageDownloadUrl={windowsState.winImageDownloadUrl}
                />
              </Stack>
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
                storageProfileError={storageProfileError}
                storageProfileHasClaimPropertySets={Boolean(claimPropertySets?.length)}
                storageProfileLoaded={storageProfileLoaded}
                testSkips={testSkips}
              />

              <CheckupsSelfValidationFormActions
                checkupImage={checkupImage}
                isDryRun={isDryRun}
                isEulaConfirmed={windowsState.isEulaConfirmed}
                name={name}
                pvcSize={pvcSize}
                selectedTestSuites={selectedTestSuites}
                storageCapabilities={storageCapabilities}
                storageClass={effectiveStorageClass}
                testSkips={testSkips}
                windowsServerTesting={windowsState.windowsServerTesting}
                winImageDownloadUrl={windowsState.winImageDownloadUrl}
              />
            </FormSection>
          </Form>
        </GridItem>
      </Grid>
    </>
  );
};

export default CheckupsSelfValidationForm;
