import React from 'react';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Stack, StackItem } from '@patternfly/react-core';

const CloudInitInfoHelper = () => {
  const { t } = useKubevirtTranslation();
  return (
    <Stack className="kv-cloudinit-info-helper--main">
      <StackItem>
        {t(
          'You can use cloud-init to initialize the operating system with a specific configuration when the VirtualMachine is started.',
        )}
      </StackItem>
      <StackItem>
        <div className="pf-v6-u-text-color-subtle">
          {t('The cloud-init service is enabled by default in Fedora and RHEL images.')}{' '}
          <ExternalLink href={documentationURL.CLOUDINIT_INFO} text={t('Learn more')} />
        </div>
      </StackItem>
    </Stack>
  );
};

export default CloudInitInfoHelper;
