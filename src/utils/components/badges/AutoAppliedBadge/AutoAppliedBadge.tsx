import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Label } from '@patternfly/react-core';

const AutoAppliedBadge: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <Label color="grey" isCompact variant="outline">
      {t('Auto-applied')}
    </Label>
  );
};

export default AutoAppliedBadge;
