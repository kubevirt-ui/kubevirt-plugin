import { V1GPU, V1HostDevice } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';

const useHardwareDevicesColumns = () => {
  const { t } = useKubevirtTranslation();

  const columns: TableColumn<V1GPU | V1HostDevice>[] = [
    {
      title: t('Resource name'),
      id: 'resourceName',
    },
    {
      title: t('Hardware device name'),
      id: 'hardwareName',
    },
  ];

  return columns;
};

export default useHardwareDevicesColumns;
