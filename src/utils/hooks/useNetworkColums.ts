import { useMemo } from 'react';

import {
  ACTIONS,
  MAC_ADDRESS,
  MODEL,
  NAME,
  NETWORK,
  STATE,
  TYPE,
} from '@kubevirt-utils/constants/network-columns';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NetworkPresentation } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';

const useNetworkColumns = () => {
  const { t } = useKubevirtTranslation();

  const columns: TableColumn<NetworkPresentation>[] = useMemo(() => {
    return [
      ...[
        NAME<NetworkPresentation>,
        MODEL<NetworkPresentation>,
        NETWORK<NetworkPresentation>,
        STATE<NetworkPresentation>,
        TYPE,
        MAC_ADDRESS<NetworkPresentation>,
      ].map((builder) => builder(t)),
      ACTIONS,
    ];
  }, [t]);

  return columns;
};

export default useNetworkColumns;
