import React, { FCC } from 'react';
import cn from 'classnames';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Badge } from '@patternfly/react-core';

import './DeprecatedBadge.scss';

type DeprecatedBadgeProps = {
  className?: string;
};

const DeprecatedBadge: FCC<DeprecatedBadgeProps> = ({ className }) => {
  const { t } = useKubevirtTranslation();

  return (
    <Badge className={cn('deprecated-badge', { [className]: Boolean(className) })}>
      {t('Deprecated')}
    </Badge>
  );
};

export default DeprecatedBadge;
