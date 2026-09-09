import { useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type NetworkPresentation } from '@kubevirt-utils/resources/vm/utils/network/constants';
import {
  Actions,
  MacAddress,
  Model,
  Name,
  Network,
  State,
  Type,
} from '@kubevirt-utils/resources/vm/utils/network/network-columns';
import { type TableColumn } from '@openshift-console/dynamic-plugin-sdk';

const useNetworkColumns = (): TableColumn<NetworkPresentation>[] => {
  const { t } = useKubevirtTranslation();

  const columns: TableColumn<NetworkPresentation>[] = useMemo(() => {
    return [
      ...[
        Name<NetworkPresentation>,
        Model<NetworkPresentation>,
        Network<NetworkPresentation>,
        State<NetworkPresentation>,
        Type,
        MacAddress<NetworkPresentation>,
      ].map((builder) => builder(t)),
      Actions,
    ];
  }, [t]);

  return columns;
};

export default useNetworkColumns;
