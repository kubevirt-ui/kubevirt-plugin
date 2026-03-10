import React, { FC } from 'react';

import TemplateValue from '@kubevirt-utils/components/TemplateValue/TemplateValue';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { NetworkPresentation } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { isPodNetwork } from '@kubevirt-utils/resources/vm/utils/network/selectors';

type TemplateNetworkCellProps = {
  row: NetworkPresentation;
};

const TemplateNetworkCell: FC<TemplateNetworkCellProps> = ({ row }) => {
  const { t } = useKubevirtTranslation();

  if (isPodNetwork(row.network)) {
    return <>{t('Pod networking')}</>;
  }

  return <TemplateValue value={row.network?.multus?.networkName ?? NO_DATA_DASH} />;
};

export default TemplateNetworkCell;
