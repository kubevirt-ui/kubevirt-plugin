import React, { type ReactElement } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Label } from '@patternfly/react-core';

const RequiredBadge = (): ReactElement => {
  const { t } = useKubevirtTranslation();
  return (
    <Label color="orange" isCompact variant="outline">
      {t('Required')}
    </Label>
  );
};

export default RequiredBadge;
