import { V1GPU, V1HostDevice } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';

const useHardwareDevicesColumns = () => {
  const { t } = useKubevirtTranslation();

  const columns: TableColumn<V1GPU | V1HostDevice>[] = [
    {
      id: 'resourceName',
      title: t('Name'),
    },
    {
      id: 'hardwareName',
      title: t('Device name'),
    },
  ];

  return columns;
};

export default useHardwareDevicesColumns;
