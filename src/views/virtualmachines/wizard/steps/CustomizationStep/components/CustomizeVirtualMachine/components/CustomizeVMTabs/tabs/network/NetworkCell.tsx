import React, { type FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { type NetworkPresentation } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { getNetworkNameLabel } from '@kubevirt-utils/resources/vm/utils/network/network-columns';

type NetworkCellProps = {
  row: NetworkPresentation;
};

const NetworkCell: FC<NetworkCellProps> = ({ row }) => {
  const { t } = useKubevirtTranslation();
  return (
    <span data-test={`nic-network-${row.network?.name}`}>
      {getNetworkNameLabel(t, { network: row.network }) ?? NO_DATA_DASH}
    </span>
  );
};

export default NetworkCell;
