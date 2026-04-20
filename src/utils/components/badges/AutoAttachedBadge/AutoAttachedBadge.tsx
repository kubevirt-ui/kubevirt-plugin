import React, { FCC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Label } from '@patternfly/react-core';

const AutoAttachedBadge: FCC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <Label className="pf-v6-u-ml-sm" color="teal">
      {t('Auto-attached')}
    </Label>
  );
};

export default AutoAttachedBadge;
