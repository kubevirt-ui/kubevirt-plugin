import React, { FC } from 'react';
import { Trans } from 'react-i18next';
import { Link } from 'react-router-dom-v5-compat';

import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Flex, Title } from '@patternfly/react-core';

const VMNetworkWizardHeader: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <div className="pf-v6-c-wizard__header">
      <div className="pf-v6-c-wizard__title">
        <Flex>
          <h1 className="pf-v6-c-wizard__title-text">{t('Create virtual machine network')}</h1>
          <Title className="pf-v6-u-text-color-subtle" headingLevel="h2">
            {t('OVN Localnet')}
          </Title>
        </Flex>
      </div>
      <div className="pf-v6-c-wizard__description">
        <Trans t={t}>
          Define a virtual network providing access to the physical underlay through a selected node
          network mapping. Learn more about{' '}
          <Link rel="noreferrer" target="_blank" to={documentationURL.NETWORKING}>
            virtual machine networks
          </Link>
          .
        </Trans>
      </div>
    </div>
  );
};

export default VMNetworkWizardHeader;
