import React, { FCC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Label } from '@patternfly/react-core';

import './PendingBadge.scss';

const PendingBadge: FCC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <Label className="pending-badge" color="orange">
      {t('Pending')}
    </Label>
  );
};

export default PendingBadge;
