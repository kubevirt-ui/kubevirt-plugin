import { TFunction } from 'i18next';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  KubevirtFilter,
  KubevirtFilterLayout,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { getGPUDevices, getHostDevices } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { HWDeviceKind } from '@search/utils/constants';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

export const getHWDevicesFilter = (t: TFunction): KubevirtFilter<V1VirtualMachine> => ({
  categoryLabel: t('Hardware devices'),
  categoryLabelShort: t('HW devices'),
  filterLayout: KubevirtFilterLayout.SELECT,
  id: VirtualMachineRowFilterType.HWDevices,
  match: (obj, selected) =>
    (selected.includes(HWDeviceKind.GPU) && !isEmpty(getGPUDevices(obj))) ||
    (selected.includes(HWDeviceKind.HOST) && !isEmpty(getHostDevices(obj))),
  options: [
    { label: t('GPU devices'), value: HWDeviceKind.GPU },
    { label: t('Host devices'), value: HWDeviceKind.HOST },
  ],
});
