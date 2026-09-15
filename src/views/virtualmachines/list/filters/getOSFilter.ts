import { type TFunction } from 'i18next';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  type KubevirtFilter,
  KubevirtFilterLayout,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { OS_NAME_LABELS } from '@kubevirt-utils/resources/template';
import { getOSLabel } from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

export const getOSFilter = (
  t: TFunction,
  isWindowsSupported = true,
): KubevirtFilter<V1VirtualMachine> => ({
  categoryLabel: t('Operating system'),
  categoryLabelShort: t('OS'),
  filterLayout: KubevirtFilterLayout.SELECT,
  id: VirtualMachineRowFilterType.OS,
  match: (obj, selected) => selected.includes(getOSLabel(obj) ?? OS_NAME_LABELS.other),
  options: Object.values(OS_NAME_LABELS)
    .filter((osName) => isWindowsSupported || osName !== OS_NAME_LABELS.windows)
    .map((osName) => ({
      label: osName,
      value: osName,
    })),
  showAllBadge: true,
});
