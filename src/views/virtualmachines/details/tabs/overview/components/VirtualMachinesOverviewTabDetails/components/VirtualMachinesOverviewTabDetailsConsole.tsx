import React, { FC } from 'react';
import { generatePath } from 'react-router-dom-v5-compat';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import VncConsole from '@kubevirt-utils/components/Consoles/components/vnc-console/VncConsole';
import { FLEET_STANDALONE_CONSOLE_PATH } from '@kubevirt-utils/components/Consoles/FleetConsoleStandAlone';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { isHeadlessMode as isHeadlessModeVMI } from '@kubevirt-utils/resources/vm/utils/selectors';
import { vmiStatuses } from '@kubevirt-utils/resources/vmi';
import { useAccessReview } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye, Button, ButtonVariant } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { Fleet } from '@stolostron/multicluster-sdk';

import VirtualMachinesOverviewTabDetailsConsoleConnect from './VirtualMachinesOverviewTabDetailsConsoleConnect';

type VirtualMachinesOverviewTabDetailsConsoleProps = {
  vmi: Fleet<V1VirtualMachineInstance>;
};

const VirtualMachinesOverviewTabDetailsConsole: FC<
  VirtualMachinesOverviewTabDetailsConsoleProps
> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();

  const isHeadlessMode = isHeadlessModeVMI(vmi);
  const isVMRunning = vmi?.status?.phase === vmiStatuses.Running;
  const [canConnectConsole] = useAccessReview({
    group: 'subresources.kubevirt.io',
    name: vmi?.metadata?.name,
    namespace: vmi?.metadata?.namespace,
    resource: 'virtualmachineinstances/vnc',
    verb: 'get',
  });
  return (
    <Bullseye className="console-overview">
      <div className="link">
        <Button
          onClick={() =>
            window.open(
              vmi?.cluster
                ? generatePath(FLEET_STANDALONE_CONSOLE_PATH, {
                    cluster: vmi.cluster,
                    name: getName(vmi),
                    namespace: getNamespace(vmi),
                  })
                : `/k8s/ns/${vmi?.metadata?.namespace}/kubevirt.io~v1~VirtualMachine/${vmi?.metadata?.name}/console/standalone`,
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
      {isVMRunning && !isHeadlessMode && canConnectConsole ? (
        <>
          <VncConsole
            CustomConnectComponent={VirtualMachinesOverviewTabDetailsConsoleConnect}
            viewOnly
            vmi={vmi}
          />
        </>
      ) : (
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
