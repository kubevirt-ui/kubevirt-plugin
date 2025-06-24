import { useMemo } from 'react';
import { TFunction } from 'react-i18next';

import {
  Actions,
  compareWithDirection,
  MacAddress,
  Model,
  Name,
  Network,
} from '@kubevirt-utils/constants/network-columns';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';

import { SimpleNICPresentation } from '../utils/types';

export const RuntimeLinkState = <T extends { runtimeLinkState?: string }>(
  t: TFunction,
): TableColumn<T> => ({
  id: 'runtime_link_state',
  sort: (data, direction) =>
    data.sort((a, b) => compareWithDirection(direction, a?.runtimeLinkState, b?.runtimeLinkState)),
  title: t('State'),
  transforms: [sortable],
});

const Type = <T extends { type?: string }>(t: TFunction): TableColumn<T> => ({
  id: 'type',
  sort: (data, direction) => data.sort((a, b) => compareWithDirection(direction, a?.type, b?.type)),
  title: t('Type'),
  transforms: [sortable],
});

const useNetworkColumns = () => {
  const { t } = useKubevirtTranslation();

  const columns: TableColumn<SimpleNICPresentation>[] = useMemo(() => {
    return [
      ...[
        Name<SimpleNICPresentation>,
        Model<SimpleNICPresentation>,
        Network<SimpleNICPresentation>,
        RuntimeLinkState<SimpleNICPresentation>,
        Type<SimpleNICPresentation>,
        MacAddress<SimpleNICPresentation>,
      ].map((builder) => builder(t)),
      Actions,
    ];
  }, [t]);

  return columns;
};

export default useNetworkColumns;
