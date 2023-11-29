import React from 'react';

import { DYNAMIC_SSH_KEY_INJECTION_LINK } from '@kubevirt-utils/components/DynamicSSHKeyInjection/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, StackItem } from '@patternfly/react-core';
import { ExternalLinkSquareAltIcon } from '@patternfly/react-icons';

const DynamicSSHKeyInjectionDescription = ({ isDynamicSSHInjectionEnabled }) => {
  const { t } = useKubevirtTranslation();

  if (!isDynamicSSHInjectionEnabled) return <>{t('Store the key in a project secret.')}</>;

  return (
    <StackItem className="text-muted">
      {t('Dynamic SSH key injection is not enabled in this virtual machine.')}{' '}
      <Button
        component="a"
        href={DYNAMIC_SSH_KEY_INJECTION_LINK}
        icon={<ExternalLinkSquareAltIcon />}
        iconPosition="right"
        isInline
        isSmall
        rel="noopener noreferrer"
        target="_blank"
        variant="link"
      >
        {t('Learn more')}
      </Button>
    </StackItem>
  );
};
export default DynamicSSHKeyInjectionDescription;
