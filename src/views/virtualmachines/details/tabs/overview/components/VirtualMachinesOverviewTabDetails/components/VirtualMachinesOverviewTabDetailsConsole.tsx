import React, { FC, memo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useK8sBaseAPIPath from '@multicluster/hooks/useK8sBaseAPIPath';
import { getConsoleStandaloneURL } from '@multicluster/urls';
import { Bullseye, Button, ButtonVariant, Spinner } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import ScreenshotBasedThumbnail from './ScreenshotBasedThumbnail';

type VirtualMachinesOverviewTabDetailsConsoleProps = {
  canConnectConsole: boolean;
  isHeadlessMode: boolean;
  isVMRunning: boolean;
  vmCluster?: string;
  vmName: string;
  vmNamespace: string;
};

const VirtualMachinesOverviewTabDetailsConsole: FC<
  VirtualMachinesOverviewTabDetailsConsoleProps
> = ({ canConnectConsole, isHeadlessMode, isVMRunning, vmCluster, vmName, vmNamespace }) => {
  const { t } = useKubevirtTranslation();
  const [apiPath, apiPathLoaded] = useK8sBaseAPIPath(vmCluster);

  const enableConsole = isVMRunning && !isHeadlessMode && canConnectConsole;

  if (!apiPathLoaded)
    return (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );

  return (
    <Bullseye className="console-overview">
      <div className="link">
        <Button
          icon={<ExternalLinkAltIcon className="icon" />}
          iconPosition="end"
          isDisabled={!enableConsole}
          onClick={() => window.open(getConsoleStandaloneURL(vmNamespace, vmName, vmCluster))}
          variant={ButtonVariant.link}
        >
          {t('Open web console')}
        </Button>
      </div>
      <ScreenshotBasedThumbnail
        apiPath={apiPath}
        isDisabled={!enableConsole}
        isHeadlessMode={isHeadlessMode}
        vmName={vmName}
        vmNamespace={vmNamespace}
      />
    </Bullseye>
  );
};

export default memo(VirtualMachinesOverviewTabDetailsConsole);
