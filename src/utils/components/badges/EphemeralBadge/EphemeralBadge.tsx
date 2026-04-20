import React, { FCC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Label } from '@patternfly/react-core';

import './EphemeralBadge.scss';

const EphemeralBadge: FCC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <Label className="ephemeral-badge" color="purple">
      {t('Ephemeral')}
    </Label>
  );
};

export default EphemeralBadge;
