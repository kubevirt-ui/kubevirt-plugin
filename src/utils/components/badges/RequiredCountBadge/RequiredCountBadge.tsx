import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Label } from '@patternfly/react-core';

type RequiredCountBadgeProps = {
  count: number;
};

const RequiredCountBadge: FC<RequiredCountBadgeProps> = ({ count }) => {
  const { t } = useKubevirtTranslation();

  if (!count) return null;

  return (
    <Label className="pf-v6-u-ml-sm" color="orange" isCompact variant="outline">
      {t('{{count}} required', { count })}
    </Label>
  );
};

export default RequiredCountBadge;
