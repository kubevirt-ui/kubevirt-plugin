import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAnnotation } from '@kubevirt-utils/resources/shared';
import { ANNOTATIONS, OS_NAME_LABELS } from '@kubevirt-utils/resources/template';
import {
  getOperatingSystem,
  getOperatingSystemName,
  OS_WINDOWS_PREFIX,
} from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { RowReducerFilter } from '@openshift-console/dynamic-plugin-sdk';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

export const getOSFilter = (): RowReducerFilter<V1VirtualMachine> => {
  const getOSName = (obj: V1VirtualMachine) => {
    const osAnnotation = getAnnotation(obj?.spec?.template, ANNOTATIONS.os);
    const osLabel = getOperatingSystemName(obj) || getOperatingSystem(obj);
    const osPreference = obj?.spec?.preference?.name;

    const termStartsWithOSName = (os: string, term?: string) =>
      term?.toLowerCase()?.startsWith(os.toLowerCase());

    const vmOSName = Object.values(OS_NAME_LABELS).find((osNameLabel) => {
      const osName = osNameLabel === OS_NAME_LABELS.windows ? OS_WINDOWS_PREFIX : osNameLabel;
      return (
        termStartsWithOSName(osName, osAnnotation) ||
        termStartsWithOSName(osName, osLabel) ||
        termStartsWithOSName(osName, osPreference)
      );
    });
    return vmOSName;
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
