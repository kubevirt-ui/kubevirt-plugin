// src/utils/components/badges/vNUMABadge/vNUMABadge.tsx
import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ButtonVariant, Label, Popover } from '@patternfly/react-core';
import { ExternalLinkSquareAltIcon } from '@patternfly/react-icons';

import './NUMABadge.scss';

const NUMABadge: FC = () => {
  const { t } = useKubevirtTranslation();

  const popoverContent = (
    <div>
      <div>{t('Virtual NUMA topology is configured for this Virtual Machine.')}</div>
      <Button
        component="a"
        href="https://kubevirt.io/user-guide/virtual_machines/numa/"
        icon={<ExternalLinkSquareAltIcon />}
        iconPosition="right"
        isInline
        rel="noopener noreferrer"
        size="sm"
        target="_blank"
        variant={ButtonVariant.link}
      >
        {t('Learn more')}
      </Button>
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
