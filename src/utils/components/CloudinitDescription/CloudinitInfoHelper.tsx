import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, Stack, StackItem } from '@patternfly/react-core';
import ExternalLinkSquareAltIcon from '@patternfly/react-icons/dist/esm/icons/external-link-square-alt-icon';

const CLOUD_INIT_DOC_LINK = 'https://cloudinit.readthedocs.io/en/latest/index.html';

const CloudInitInfoHelper = () => {
  const { t } = useKubevirtTranslation();
  return (
    <Stack className="kv-cloudinit-info-helper--main">
      <StackItem>
        {t(
          'You can use Cloud-init for post installation configuration of the guest operating system.',
        )}
      </StackItem>
      <StackItem>{t('The guest OS needs to have the Cloud-init service running.')}</StackItem>
      <StackItem>
        <div className="text-muted">
          {t('Cloud-init is already configured in cloud images of Fedora and RHEL')}{' '}
          <Button
            isSmall
            isInline
            variant="link"
            icon={<ExternalLinkSquareAltIcon />}
            iconPosition="right"
          >
            <a href={CLOUD_INIT_DOC_LINK} target="_blank" rel="noopener noreferrer">
              {t('Learn more')}
            </a>
          </Button>
        </div>
      </StackItem>
    </Stack>
  );
};

export default CloudInitInfoHelper;
