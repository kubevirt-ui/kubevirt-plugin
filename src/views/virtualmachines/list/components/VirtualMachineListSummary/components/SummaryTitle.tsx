import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Stack, Title } from '@patternfly/react-core';

type SummaryTitleProps = {
  showVMsCount: boolean;
  vmsCount: number;
};

const SummaryTitle: FC<SummaryTitleProps> = ({ showVMsCount, vmsCount }) => {
  const { t } = useKubevirtTranslation();

  return (
    <Stack className="vm-list-summary__expand-section-toggle">
      <Title headingLevel="h3">{t('Summary')}</Title>
      {showVMsCount && (
        <div className="pf-v6-u-font-size-md pf-v6-u-mt-xs">
          {t('Virtual Machines ({{count}})', { count: vmsCount })}
        </div>
      )}
    </Stack>
  );
};

export default SummaryTitle;
