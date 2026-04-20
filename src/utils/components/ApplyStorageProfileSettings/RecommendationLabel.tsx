import React, { FCC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Label } from '@patternfly/react-core';

const RecommendationLabel: FCC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <Label className="pf-m-success" isCompact variant="outline">
      {t('Default')}
    </Label>
  );
};

export default RecommendationLabel;
