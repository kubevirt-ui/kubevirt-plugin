import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Content } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';

type AutoAppliedCountProps = {
  count: number;
};

const AutoAppliedCount: FC<AutoAppliedCountProps> = ({ count }) => {
  const { t } = useKubevirtTranslation();

  return (
    <Content className="pf-v6-u-mb-sm pf-v6-u-text-color-subtle" component="small">
      <InfoCircleIcon /> {t('{{count}} label auto-applied by your administrator', { count })}
    </Content>
  );
};

export default AutoAppliedCount;
