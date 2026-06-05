import { TFunction } from 'i18next';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  KubevirtFilter,
  KubevirtFilterLayout,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getNetworks } from '@kubevirt-utils/resources/vm/utils/selectors';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

export const getNADsFilter = (t: TFunction): KubevirtFilter<V1VirtualMachine> => ({
  categoryLabel: t('NADs'),
  filterLayout: KubevirtFilterLayout.HIDDEN,
  id: VirtualMachineRowFilterType.NAD,
  match: (obj, selected) => {
    const networkNames = getNetworks(obj)
      ?.map((network) => network.multus?.networkName)
      .filter(Boolean)
      .map((networkName) =>
        networkName?.includes('/') ? networkName : `${getNamespace(obj)}/${networkName}`,
      );
    return networkNames?.some((networkName) => selected.includes(networkName));
  },
});
