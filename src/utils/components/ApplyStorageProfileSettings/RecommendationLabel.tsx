import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Label } from '@patternfly/react-core';

const RecommendationLabel: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <Label className="pf-m-success" isCompact variant="outline">
      {t('Default')}
    </Label>
  );
};

export default RecommendationLabel;
