import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Content, ContentVariants } from '@patternfly/react-core';

const AdvancedCDROMPopoverContent: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <div>
      <Content component={ContentVariants.h6}>{t('Advanced CD-ROM features')}</Content>
      <Content component={ContentVariants.p}>
        <Trans t={t}>
          <div>
            This will enable{' '}
            <ExternalLink href={documentationURL.DECLARATIVE_HOTPLUG_VOLUMES}>
              DeclarativeHotplugVolumes
            </ExternalLink>{' '}
            feature gate and allow ejecting CD-ROM disks and adding empty CD-ROM drives.
          </div>
        </Trans>
      </Content>
    </div>
  );
};

export default AdvancedCDROMPopoverContent;
