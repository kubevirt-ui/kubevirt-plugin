import React, { type ReactElement } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Label } from '@patternfly/react-core';

import './new-badge.scss';

const NewBadge = (): ReactElement => {
  const { t } = useKubevirtTranslation();
  return (
    <Label className={'NewBadge--main'} color="blue" isCompact>
      {t('New')}
    </Label>
  );
};

export default NewBadge;
