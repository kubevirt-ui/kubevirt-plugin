import React, { memo, useEffect } from 'react';

import { getConsoleBasePath } from '@kubevirt-utils/components/Consoles/utils/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useScreenshot from '@kubevirt-utils/hooks/useScreenshot';

import VirtualMachinesOverviewTabDetailsConsoleConnect from './VirtualMachinesOverviewTabDetailsConsoleConnect';

const ScreenshotBasedThumbnail = ({
  apiPath,
  isDisabled,
  isHeadlessMode,
  refreshInterval = 5000,
  vmName,
  vmNamespace,
}: {
  apiPath: string;
  isDisabled: boolean;
  isHeadlessMode: boolean;
  refreshInterval?: number;
  vmName: string;
  vmNamespace: string;
}) => {
  const { t } = useKubevirtTranslation();
  const basePath = getConsoleBasePath({ apiPath, name: vmName, namespace: vmNamespace });
  const { error, loaded, refreshScreenshot, screenshot } = useScreenshot(basePath);

  useEffect(() => {
    const interval = setInterval(refreshScreenshot, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshScreenshot]);

  if (!screenshot && (error || !loaded)) {
    return (
      <VirtualMachinesOverviewTabDetailsConsoleConnect
        isConnecting={!loaded}
        isDisabled={isDisabled}
        isHeadlessMode={isHeadlessMode}
        refresh={refreshScreenshot}
      />
    );
  }
  return (
    <div>
      <img
        alt={t('Screenshot from the VM')}
        onClick={refreshScreenshot}
        src={URL.createObjectURL(screenshot)}
        style={{ cursor: 'pointer' }}
      />
    </div>
  );
};

export default memo(ScreenshotBasedThumbnail);
