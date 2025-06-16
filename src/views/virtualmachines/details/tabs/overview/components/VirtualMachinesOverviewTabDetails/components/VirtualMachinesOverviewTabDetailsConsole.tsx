import React, { FC, useState } from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import VncConsole from '@kubevirt-utils/components/Consoles/components/vnc-console/VncConsole';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isHeadlessMode as isHeadlessModeVMI } from '@kubevirt-utils/resources/vm/utils/selectors';
import { vmiStatuses } from '@kubevirt-utils/resources/vmi';
import { useAccessReview } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye, Button, ButtonVariant } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import VirtualMachinesOverviewTabDetailsConsoleConnect from './VirtualMachinesOverviewTabDetailsConsoleConnect';

type VirtualMachinesOverviewTabDetailsConsoleProps = {
  vmi: V1VirtualMachineInstance;
};

const VirtualMachinesOverviewTabDetailsConsole: FC<
  VirtualMachinesOverviewTabDetailsConsoleProps
> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();

  const [connect, setConnect] = useState(false);

  const isHeadlessMode = isHeadlessModeVMI(vmi);
  const isVMRunning = vmi?.status?.phase === vmiStatuses.Running;
  const [canConnectConsole] = useAccessReview({
    group: 'subresources.kubevirt.io',
    name: vmi?.metadata?.name,
    namespace: vmi?.metadata?.namespace,
    resource: 'virtualmachineinstances/vnc',
    verb: 'get',
  });

  const availableConsole = isVMRunning && !isHeadlessMode && canConnectConsole;
  return (
    <Bullseye className="console-overview">
      <div className="link">
        <Button
          onClick={() =>
            window.open(
              `/k8s/ns/${vmi?.metadata?.namespace}/kubevirt.io~v1~VirtualMachine/${vmi?.metadata?.name}/console/standalone`,
            )
          }
          icon={<ExternalLinkAltIcon className="icon" />}
          iconPosition="end"
          isDisabled={!isVMRunning || isHeadlessMode || !canConnectConsole}
          variant={ButtonVariant.link}
        >
          {t('Open web console')}
        </Button>
      </div>
      {availableConsole && connect && (
        <>
          <VncConsole
            CustomConnectComponent={VirtualMachinesOverviewTabDetailsConsoleConnect}
            viewOnly
            vmi={vmi}
          />
        </>
      )}

      {availableConsole && !connect && (
        <div className="console-vnc">
          <VirtualMachinesOverviewTabDetailsConsoleConnect
            connect={() => setConnect(true)}
            isConnecting={false}
            isHeadlessMode={isHeadlessMode}
          />
        </div>
      )}

      {!availableConsole && (
        <div className="console-vnc">
          <VirtualMachinesOverviewTabDetailsConsoleConnect
            isDisabled
            isHeadlessMode={isHeadlessMode}
          />
        </div>
      )}
    </Bullseye>
  );
};

export default VirtualMachinesOverviewTabDetailsConsole;
