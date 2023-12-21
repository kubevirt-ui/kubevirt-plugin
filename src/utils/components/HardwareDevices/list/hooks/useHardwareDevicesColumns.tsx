import * as React from 'react';

import { V1GPU, V1HostDevice } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';

const useHardwareDevicesColumns = () => {
  const { t } = useKubevirtTranslation();

  const columns: TableColumn<V1GPU | V1HostDevice>[] = React.useMemo(
    () => [
      {
        id: 'name',
        props: { className: 'pf-m-width-20' },
        title: t('Name'),
      },
      {
        id: 'deviceName',
        props: { className: 'pf-m-width-30' },
        title: t('Device name'),
      },
      {
        id: '',
        props: { className: 'dropdown-kebab-pf pf-v5-c-table__action' },
        title: '',
      },
    ],
    [t],
  );

  return columns;
};

export default useHardwareDevicesColumns;
