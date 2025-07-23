import React, { FC } from 'react';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Label, Popover } from '@patternfly/react-core';

import './NUMABadge.scss';

const NUMABadge: FC = () => {
  const { t } = useKubevirtTranslation();

  const popoverContent = (
    <div>
      <div>{t('Virtual NUMA topology is configured for this Virtual Machine.')}</div>
      <ExternalLink
        href="https://kubevirt.io/user-guide/virtual_machines/numa/"
        text={t('Learn more')}
      />
    </div>
  );

  return (
    <Popover bodyContent={popoverContent} hasAutoWidth position="right" triggerAction="hover">
      <Label className="numa-badge" color="grey" isCompact>
        {t('vNUMA')}
      </Label>
    </Popover>
  );
};

export default NUMABadge;
