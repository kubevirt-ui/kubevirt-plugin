import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { NetworkPresentation } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { getNetworkNameLabel } from '@kubevirt-utils/resources/vm/utils/network/network-columns';

type NetworkCellProps = {
  row: NetworkPresentation;
};

const NetworkCell: FC<NetworkCellProps> = ({ row }) => {
  const { t } = useKubevirtTranslation();
  return <>{getNetworkNameLabel(t, { network: row.network }) ?? NO_DATA_DASH}</>;
};

export default NetworkCell;
