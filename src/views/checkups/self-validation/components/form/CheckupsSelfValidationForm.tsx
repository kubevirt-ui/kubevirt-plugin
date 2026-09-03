import React, { type ReactNode, useState } from 'react';

import ClusterProjectDropdown from '@kubevirt-utils/components/ClusterProjectDropdown/ClusterProjectDropdown';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { Form, FormSection, Grid, GridItem, Stack } from '@patternfly/react-core';

import AdvancedSettings from './AdvancedSettings';
import CheckupsSelfValidationFormActions from './CheckupsSelfValidationFormActions';
import CheckupsSelfValidationFormFields from './components/CheckupsSelfValidationFormFields';
import { type SelfValidationStorageSubmit, type WindowsValidationSubmit } from './types';
import useCheckupsSelfValidationFormState from './useCheckupsSelfValidationFormState';
import WindowsValidationSettings from './WindowsValidationSettings';

import './checkups-self-validation-form.scss';

const defaultStorageSubmit: SelfValidationStorageSubmit = {
  pvcSize: '',
  storageCapabilities: [],
  storageClass: '',
};

const defaultWindowsSubmit: WindowsValidationSubmit = {
  isEulaConfirmed: false,
  windowsServerTesting: false,
  winImageDownloadUrl: '',
};

const CheckupsSelfValidationForm = (): ReactNode => {
  const { t } = useKubevirtTranslation();
  const cluster = useClusterParam();
  const [storageSubmit, setStorageSubmit] =
    useState<SelfValidationStorageSubmit>(defaultStorageSubmit);
  const [windowsSubmit, setWindowsSubmit] = useState<WindowsValidationSubmit>(defaultWindowsSubmit);

  const {
    checkupImage,
    checkupImageIsFallback,
    checkupImageLoaded,
    checkupImageLoadError,
    handleTestSuiteSelect,
    isDryRun,
    name,
    pipelinesInstalled,
    pipelinesLoaded,
    selectedTestSuites,
    setIsDryRun,
    setName,
    setTestSkips,
    testSkips,
    testSuitesToggleTitle,
  } = useCheckupsSelfValidationFormState(t);

  return (
    <>
      <ClusterProjectDropdown includeAllClusters={false} includeAllProjects={false} />
      <Grid>
        <GridItem span={6}>
          <Form className={'CheckupsSelfValidationForm--main'}>
            <FormSection title={t('Run self validation checkup')} titleElement="h1">
              <CheckupsSelfValidationFormFields
                checkupImage={checkupImage ?? ''}
                checkupImageIsFallback={checkupImageIsFallback}
                checkupImageLoaded={checkupImageLoaded}
                checkupImageLoadError={checkupImageLoadError}
                handleTestSuiteSelect={handleTestSuiteSelect}
                name={name}
                selectedTestSuites={selectedTestSuites}
                setName={setName}
                testSuitesToggleTitle={testSuitesToggleTitle}
              />
              <Stack hasGutter>
                <WindowsValidationSettings
                  onWindowsChange={setWindowsSubmit}
                  pipelinesInstalled={pipelinesInstalled}
                  pipelinesLoaded={pipelinesLoaded}
                  selectedTestSuites={selectedTestSuites}
                />
              </Stack>
              <AdvancedSettings
                cluster={cluster}
                isDryRun={isDryRun}
                onStorageChange={setStorageSubmit}
                selectedTestSuites={selectedTestSuites}
                setIsDryRun={setIsDryRun}
                setTestSkips={setTestSkips}
                testSkips={testSkips}
              />
              <CheckupsSelfValidationFormActions
                checkupImage={checkupImage ?? ''}
                isDryRun={isDryRun}
                isEulaConfirmed={windowsSubmit.isEulaConfirmed}
                name={name}
                pvcSize={storageSubmit.pvcSize}
                selectedTestSuites={selectedTestSuites}
                storageCapabilities={storageSubmit.storageCapabilities}
                storageClass={storageSubmit.storageClass}
                testSkips={testSkips}
                windowsServerTesting={windowsSubmit.windowsServerTesting}
                winImageDownloadUrl={windowsSubmit.winImageDownloadUrl}
              />
            </FormSection>
          </Form>
        </GridItem>
      </Grid>
    </>
  );
};

export default CheckupsSelfValidationForm;
