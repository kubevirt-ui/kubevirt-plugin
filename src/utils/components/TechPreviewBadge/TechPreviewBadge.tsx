import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Badge } from '@patternfly/react-core';
import { WarningTriangleIcon } from '@patternfly/react-icons';

import './TechPreviewBadge.scss';

const TechPreviewBadge: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <Badge className="kv-tech-preview-badge ">
      <WarningTriangleIcon /> {t('Technology preview')}
    </Badge>
  );
};

export default TechPreviewBadge;
