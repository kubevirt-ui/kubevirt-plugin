import * as React from 'react';
import { Trans } from 'react-i18next';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button } from '@patternfly/react-core';
import ExternalLinkSquareAltIcon from '@patternfly/react-icons/dist/esm/icons/external-link-square-alt-icon';

const CloudInitAuthKeyHelp: React.FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <div className="pf-c-form__helper-text" aria-live="polite">
      <Trans t={t} ns="plugin__kubevirt-plugin">
        Authorized keys must follow the SSH Public key format
      </Trans>{' '}
      <Button
        isSmall
        isInline
        variant="link"
        icon={<ExternalLinkSquareAltIcon />}
        iconPosition="right"
      >
        <a
          href={'https://www.redhat.com/sysadmin/configure-ssh-keygen'}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('Learn more')}
        </a>
      </Button>
    </div>
  );
};

export default CloudInitAuthKeyHelp;
