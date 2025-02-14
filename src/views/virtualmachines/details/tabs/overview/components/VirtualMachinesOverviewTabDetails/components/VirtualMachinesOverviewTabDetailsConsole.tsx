import React, { FC } from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { inlined16beta } from '@kubevirt-utils/components/Consoles/components/novnc/inlined';
import VncConsole from '@kubevirt-utils/components/Consoles/components/vnc-console/VncConsole';
import { INSECURE, SECURE } from '@kubevirt-utils/components/Consoles/utils/constants';
import { isConnectionEncrypted } from '@kubevirt-utils/components/Consoles/utils/utils';
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

  const isHeadlessMode = isHeadlessModeVMI(vmi);
  const isVMRunning = vmi?.status?.phase === vmiStatuses.Running;
  const [canConnectConsole] = useAccessReview({
    group: 'subresources.kubevirt.io',
    name: vmi?.metadata?.name,
    namespace: vmi?.metadata?.namespace,
    resource: 'virtualmachineinstances/vnc',
    verb: 'get',
  });

  const toObjectUrl = (
    inlineHtml: (args: { host: string; path: string; port: string }) => string,
  ) => {
    const path = `api/kubernetes/apis/subresources.kubevirt.io/v1/namespaces/${vmi?.metadata?.namespace}/virtualmachineinstances/${vmi?.metadata?.name}/vnc`;
    const host = window.location.hostname;
    const port = window.location.port || (isConnectionEncrypted() ? SECURE : INSECURE);
    const objectUrl = URL.createObjectURL(
      new Blob([inlineHtml({ host, path, port })], { type: 'text/html' }),
    );
    return objectUrl;
  };

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
      <div className="link">
        <Button
          icon={<ExternalLinkAltIcon className="icon" />}
          iconPosition="end"
          isDisabled={!isVMRunning || isHeadlessMode || !canConnectConsole}
          onClick={() => window.open(toObjectUrl(inlined16beta))}
          variant="link"
        >
          {t('Open novnc 1.6beta console')}
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
