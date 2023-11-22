import { V1GPU, V1HostDevice } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';

const useHardwareDevicesColumns = () => {
  const { t } = useKubevirtTranslation();

  const columns: TableColumn<V1GPU | V1HostDevice>[] = [
    {
      id: 'resourceName',
      title: t('Resource name'),
    },
    {
      id: 'hardwareName',
      title: t('Hardware device name'),
    },
  ];

  return columns;
};

export default useHardwareDevicesColumns;
