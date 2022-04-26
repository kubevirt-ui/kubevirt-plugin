import React from 'react';
import { Trans } from 'react-i18next';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { DEFAULT_RDP_PORT, TEMPLATE_VM_NAME_LABEL } from '../utils/constants';
import { RdpServiceNotConfiguredProps } from '../utils/types';

const RdpServiceNotConfigured: React.FC<RdpServiceNotConfiguredProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const name = vm?.metadata?.name;

  return (
    <Trans t={t} ns="plugin__kubevirt-plugin">
      <span>
        This is a Windows virtual machine but no Service for the RDP (Remote Desktop Protocol) can
        be found.
      </span>
      <br />
      <span>
        For better experience accessing Windows console, it is recommended to use the RDP. To do so,
        create a service:
        <ul>
          <li>
            exposing the{' '}
            <b>
              {DEFAULT_RDP_PORT}
              /tcp
            </b>{' '}
            port of the virtual machine
          </li>
          <li>
            using selector:{' '}
            <b>
              {TEMPLATE_VM_NAME_LABEL}: {name}
            </b>
          </li>
          <li>
            Example: virtctl expose virtualmachine {name} --name {name}
            -rdp --port [UNIQUE_PORT] --target-port {DEFAULT_RDP_PORT} --type NodePort
          </li>
        </ul>
        Make sure, the VM object has <b>spec.template.metadata.labels</b> set to{' '}
        <b>
          {TEMPLATE_VM_NAME_LABEL}: {name}
        </b>
      </span>
    </Trans>
  );
};

export default RdpServiceNotConfigured;
