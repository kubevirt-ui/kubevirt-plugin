import React from 'react';
import { Trans } from 'react-i18next';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

const DeschedulerPopover = () => {
  const { t } = useKubevirtTranslation();

  return (
    <Trans ns="plugin__kubevirt-plugin" t={t}>
      <p>
        The descheduler can be used to evict a running pod to allow the pod to be rescheduled onto a
        more suitable node.
      </p>
      <br />
      <p>Note: if VirtualMachine has LiveMigratable=False condition, edit is disabled.</p>
    </Trans>
  );
};

export default DeschedulerPopover;
