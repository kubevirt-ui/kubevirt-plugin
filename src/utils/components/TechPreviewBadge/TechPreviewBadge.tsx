import React, { FCC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Label } from '@patternfly/react-core';

const TechPreviewBadge: FCC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <Label isCompact status="warning" variant="outline">
      {t('Technology preview')}
    </Label>
  );
};

export default TechPreviewBadge;
