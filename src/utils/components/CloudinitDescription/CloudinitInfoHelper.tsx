import React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, Stack, StackItem } from '@patternfly/react-core';
import { ExternalLinkSquareAltIcon } from '@patternfly/react-icons';

const CLOUD_INIT_DOC_LINK = 'https://cloudinit.readthedocs.io/en/latest/index.html';

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
        <div className="text-muted">
          {t('The cloud-init service is enabled by default in Fedora and RHEL images.')}{' '}
          <Button
            icon={<ExternalLinkSquareAltIcon />}
            iconPosition="right"
            isInline
            size="sm"
            variant="link"
          >
            <a href={CLOUD_INIT_DOC_LINK} rel="noopener noreferrer" target="_blank">
              {t('Learn more')}
            </a>
          </Button>
        </div>
      </StackItem>
    </Stack>
  );
};

export default CloudInitInfoHelper;
