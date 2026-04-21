import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { UtilizationBlock } from './UtilizationBlock';

type NoDataUtilizationBlockProps = {
  dataTestId: string;
  isNetworkUtil?: boolean;
  title: string;
};

const NoDataUtilizationBlock: FC<NoDataUtilizationBlockProps> = ({
  dataTestId,
  isNetworkUtil = false,
  title,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <UtilizationBlock
      dataTestId={dataTestId}
      isNetworkUtil={isNetworkUtil}
      title={title}
      usageValue={t('Not available')}
      usedOfTotalText=""
    />
  );
};

export default NoDataUtilizationBlock;
