import React from 'react';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { StackItem } from '@patternfly/react-core';

const DynamicSSHKeyInjectionDescription = ({ isDynamicSSHInjectionEnabled }) => {
  const { t } = useKubevirtTranslation();

  if (isDynamicSSHInjectionEnabled) return <>{t('Store the key in a project secret.')}</>;

  return (
    <StackItem className="pf-v6-u-text-color-subtle">
      {t('Dynamic SSH key injection is not enabled in this virtual machine.')}{' '}
      <ExternalLink href={documentationURL.DYNAMIC_SSH_KEY_INJECTION} text={t('Learn more')} />
    </StackItem>
  );
};
export default DynamicSSHKeyInjectionDescription;
