import React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Label } from '@patternfly/react-core';

import './new-badge.scss';

const NewBadge = () => {
  const { t } = useKubevirtTranslation();
  return (
    <Label className={'NewBadge--main'} color="blue" isCompact>
      {t('New')}
    </Label>
  );
};

export default NewBadge;
