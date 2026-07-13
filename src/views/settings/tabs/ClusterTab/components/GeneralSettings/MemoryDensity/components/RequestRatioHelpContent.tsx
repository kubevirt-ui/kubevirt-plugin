import React, { FC } from 'react';

import { Trans } from 'react-i18next';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Content } from '@patternfly/react-core';

const RequestRatioHelpContent: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <Content>
      <p>{t('After changes are saved, they apply cluster-wide:')}</p>
      <p>
        <Trans ns="plugin__kubevirt-plugin">
          <strong>New VMs:</strong> Created with the set ratio, unless they have a specific ratio
          set by the VM owner.
        </Trans>
      </p>
      <p>
        <Trans ns="plugin__kubevirt-plugin">
          <strong>Running VMs:</strong> Retain their current ratio until they reboot or migrate.
        </Trans>
      </p>
    </Content>
  );
};

export default RequestRatioHelpContent;
