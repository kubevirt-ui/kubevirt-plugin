import * as React from 'react';
import { Link } from 'react-router-dom';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { VNC_CONSOLE_TYPE } from '@kubevirt-utils/components/Consoles/components/utils/ConsoleConsts';
import VncConsole from '@kubevirt-utils/components/Consoles/components/vnc-console/VncConsole';
import { INSECURE, SECURE } from '@kubevirt-utils/components/Consoles/utils/constants';
import { isConnectionEncrypted } from '@kubevirt-utils/components/Consoles/utils/utils';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { vmiStatuses } from '@kubevirt-utils/resources/vmi';
import { Bullseye } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

type VirtualMachinesOverviewTabDetailsConsoleProps = {
  vmi: V1VirtualMachineInstance;
};

const VirtualMachinesOverviewTabDetailsConsole: React.FC<
  VirtualMachinesOverviewTabDetailsConsoleProps
> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();

  const isEncrypted = isConnectionEncrypted();

  return (
    <Bullseye className="bullseye">
      {vmi?.status?.phase === vmiStatuses.Running ? (
        <>
          <VncConsole
            type={VNC_CONSOLE_TYPE}
            encrypt={isEncrypted}
            host={window.location.hostname}
            port={window.location.port || (isEncrypted ? SECURE : INSECURE)}
            path={`api/kubernetes/apis/subresources.kubevirt.io/v1/namespaces/${vmi?.metadata?.namespace}/virtualmachineinstances/${vmi?.metadata?.name}/vnc`}
            scaleViewport
            showAccessControls={false}
          />
          <div className="link">
            <Link to="/">
              {t('Open web console')}
              <ExternalLinkAltIcon className="icon" />
            </Link>
          </div>
        </>
      ) : (
        <MutedTextSpan text={t('Virtual machine is not running')} />
      )}
    </Bullseye>
  );
};

export default VirtualMachinesOverviewTabDetailsConsole;
