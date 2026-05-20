import React from 'react';
import { Trans } from 'react-i18next';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

const DeschedulerPopover = () => {
  const { t } = useKubevirtTranslation();

  return (
    <Trans ns="plugin__kubevirt-plugin" t={t}>
      <p>
        The descheduler evicts a running pod so that the pod can be rescheduled on a more suitable
        node.
      </p>
      <br />
      <p>Note: This setting is disabled if the VirtualMachine is not live migratable.</p>
    </Trans>
  );
};

export default DeschedulerPopover;
