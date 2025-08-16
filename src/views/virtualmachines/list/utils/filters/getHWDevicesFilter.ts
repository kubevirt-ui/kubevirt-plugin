import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getGPUDevices, getHostDevices } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { HWDeviceKind } from '@search/utils/constants';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

export const getHWDevicesFilter = (): RowFilter<V1VirtualMachine> => ({
  filter: (input, vm) =>
    isEmpty(input.selected) ||
    (input.selected?.includes(HWDeviceKind.GPU) && !isEmpty(getGPUDevices(vm))) ||
    (input.selected?.includes(HWDeviceKind.HOST) && !isEmpty(getHostDevices(vm))),
  filterGroupName: t('Hardware devices'),
  isMatch: () => true,
  items: [
    { id: HWDeviceKind.GPU, title: t('GPU devices') },
    { id: HWDeviceKind.HOST, title: t('Host devices') },
  ],
  type: VirtualMachineRowFilterType.HWDevices,
});
