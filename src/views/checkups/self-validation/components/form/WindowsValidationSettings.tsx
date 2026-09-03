import React, { type FC, useEffect } from 'react';
import { Trans } from 'react-i18next';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { HelperText, HelperTextItem, Stack, StackItem } from '@patternfly/react-core';

import { WINDOWS_GOLDEN_IMAGE_MANIFEST_URL } from '../../utils/constants';
import WindowsDownloadUrlField from './components/WindowsDownloadUrlField';
import WindowsEulaCheckbox from './components/WindowsEulaCheckbox';
import WindowsTestingSwitch from './components/WindowsTestingSwitch';
import WindowsImageCreationInfoAlert from './components/windowsValidationAlerts/WindowsImageCreationInfoAlert';
import WindowsPipelinesMissingAlert from './components/windowsValidationAlerts/WindowsPipelinesMissingAlert';
import { type WindowsValidationSettingsProps } from './types';
import useWindowsValidationFormState from './useWindowsValidationFormState';

const WindowsValidationSettings: FC<WindowsValidationSettingsProps> = ({
  onWindowsChange,
  pipelinesInstalled,
  pipelinesLoaded,
  selectedTestSuites,
}) => {
  const { t } = useKubevirtTranslation();
  const {
    isEulaConfirmed,
    isTier2Selected,
    setIsEulaConfirmed,
    setWindowsServerTesting,
    setWinImageDownloadUrl,
    windowsServerTesting,
    winImageDownloadUrl,
  } = useWindowsValidationFormState(selectedTestSuites);
  const pipelinesMissing = pipelinesLoaded && !pipelinesInstalled;

  useEffect((): void => {
    onWindowsChange({ isEulaConfirmed, windowsServerTesting, winImageDownloadUrl });
  }, [isEulaConfirmed, onWindowsChange, winImageDownloadUrl, windowsServerTesting]);

  return (
    <>
      <WindowsTestingSwitch
        isTier2Selected={isTier2Selected}
        setWindowsServerTesting={setWindowsServerTesting}
        windowsServerTesting={windowsServerTesting}
      />
      {windowsServerTesting && (
        <StackItem>
          <Stack hasGutter>
            <WindowsEulaCheckbox
              isEulaConfirmed={isEulaConfirmed}
              setIsEulaConfirmed={setIsEulaConfirmed}
            />
            {pipelinesMissing && <WindowsPipelinesMissingAlert />}
            <StackItem className="pf-v6-u-pl-lg">
              <WindowsDownloadUrlField
                setWinImageDownloadUrl={setWinImageDownloadUrl}
                winImageDownloadUrl={winImageDownloadUrl}
              />
            </StackItem>
            <WindowsImageCreationInfoAlert pipelinesMissing={pipelinesMissing} />
            <StackItem className="pf-v6-u-pl-lg">
              <HelperText>
                <HelperTextItem>
                  <Trans ns="plugin__kubevirt-plugin" t={t}>
                    Already have a Windows image? Apply the{' '}
                    <ExternalLink href={WINDOWS_GOLDEN_IMAGE_MANIFEST_URL}>
                      golden-image.yaml manifest before running.
                    </ExternalLink>
                  </Trans>
                </HelperTextItem>
              </HelperText>
            </StackItem>
          </Stack>
        </StackItem>
      )}
    </>
  );
};

export default WindowsValidationSettings;
