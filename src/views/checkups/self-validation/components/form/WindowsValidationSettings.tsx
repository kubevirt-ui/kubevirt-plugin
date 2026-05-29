import React, { FC } from 'react';

import WindowsDownloadUrlField from './components/WindowsDownloadUrlField';
import WindowsEulaCheckbox from './components/WindowsEulaCheckbox';
import WindowsImageNameField from './components/WindowsImageNameField';
import WindowsTestingSwitch from './components/WindowsTestingSwitch';
import { WindowsValidationSettingsProps } from './types';
import { isDownloadUrlDisabled, shouldShowDownloadUrlTooltip } from './utils';

const WindowsValidationSettings: FC<WindowsValidationSettingsProps> = ({
  acceptWindowsEula,
  dataSourceOptions,
  dataSourcesError,
  dataSourcesLoaded,
  isEulaConfirmed,
  isTier2Selected,
  setAcceptWindowsEula,
  setIsEulaConfirmed,
  setWinImageDownloadUrl,
  setWinImageName,
  winImageDownloadUrl,
  winImageName,
}) => {
  const downloadUrlDisabled = isDownloadUrlDisabled(winImageName, dataSourceOptions);
  const showDownloadUrlTooltip = shouldShowDownloadUrlTooltip(
    winImageName,
    winImageDownloadUrl,
    dataSourceOptions,
  );

  return (
    <>
      <WindowsTestingSwitch
        acceptWindowsEula={acceptWindowsEula}
        isTier2Selected={isTier2Selected}
        setAcceptWindowsEula={setAcceptWindowsEula}
      />
      {acceptWindowsEula && (
        <div aria-live="polite">
          <WindowsEulaCheckbox
            isEulaConfirmed={isEulaConfirmed}
            setIsEulaConfirmed={setIsEulaConfirmed}
          />
          <WindowsDownloadUrlField
            isDownloadUrlDisabled={downloadUrlDisabled}
            setWinImageDownloadUrl={setWinImageDownloadUrl}
            showDownloadUrlTooltip={showDownloadUrlTooltip}
            winImageDownloadUrl={winImageDownloadUrl}
          />
          <WindowsImageNameField
            dataSourceOptions={dataSourceOptions}
            dataSourcesError={dataSourcesError}
            dataSourcesLoaded={dataSourcesLoaded}
            setWinImageName={setWinImageName}
            winImageName={winImageName}
          />
        </div>
      )}
    </>
  );
};

export default WindowsValidationSettings;
