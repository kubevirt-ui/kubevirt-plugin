import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAnnotation } from '@kubevirt-utils/resources/shared';
import { ANNOTATIONS, OS_NAME_LABELS } from '@kubevirt-utils/resources/template';
import {
  getOperatingSystem,
  getOperatingSystemName,
} from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

export const useOSFilter = (): RowFilter<V1VirtualMachine> => {
  const getOSName = (obj: V1VirtualMachine) => {
    const osAnnotation = getAnnotation(obj?.spec?.template, ANNOTATIONS.os);
    const osLabel = getOperatingSystemName(obj) || getOperatingSystem(obj);
    const osPreference = obj?.spec?.preference?.name;

    const termStartsWithOSName = (os: string, term?: string) =>
      term?.toLowerCase()?.startsWith(os.toLowerCase());

    const osName = Object.values(OS_NAME_LABELS).find(
      (osKey) =>
        termStartsWithOSName(osKey, osAnnotation) ||
        termStartsWithOSName(osKey, osLabel) ||
        termStartsWithOSName(osKey, osPreference),
    );
    return osName;
  };

  return {
    filter: (selectedOS, obj) => {
      return selectedOS.selected?.length === 0 || selectedOS.selected?.includes(getOSName(obj));
    },
    filterGroupName: t('Operating system'),
    items: Object.values(OS_NAME_LABELS).map((osName) => ({
      id: osName,
      title: osName,
    })),
    reducer: getOSName,
    type: VirtualMachineRowFilterType.OS,
  };
};
