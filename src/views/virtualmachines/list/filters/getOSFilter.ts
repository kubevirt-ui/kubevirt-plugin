import { TFunction } from 'i18next';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  KubevirtFilter,
  KubevirtFilterLayout,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { getAnnotation } from '@kubevirt-utils/resources/shared';
import { ANNOTATIONS, OS_NAME_LABELS } from '@kubevirt-utils/resources/template';
import { getPreferenceMatcher } from '@kubevirt-utils/resources/vm';
import {
  getOperatingSystem,
  getOperatingSystemName,
  matchOSName,
} from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

const getOSName = (obj: V1VirtualMachine) => {
  const osAnnotation = getAnnotation(obj?.spec?.template, ANNOTATIONS.os);
  const osLabel = getOperatingSystemName(obj) || getOperatingSystem(obj);
  const osPreference = getPreferenceMatcher(obj)?.name;

  return matchOSName(osAnnotation, osLabel, osPreference);
};

export const getOSFilter = (t: TFunction): KubevirtFilter<V1VirtualMachine> => ({
  categoryLabel: t('Operating system'),
  categoryLabelShort: t('OS'),
  filterLayout: KubevirtFilterLayout.SELECT,
  id: VirtualMachineRowFilterType.OS,
  match: (obj, selected) => selected.includes(getOSName(obj)),
  options: Object.values(OS_NAME_LABELS).map((osName) => ({
    label: osName,
    value: osName,
  })),
  showAllBadge: true,
});
