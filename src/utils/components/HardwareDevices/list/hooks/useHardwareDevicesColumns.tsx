import * as React from 'react';

import { V1GPU, V1HostDevice } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';

const useHardwareDevicesColumns = () => {
  const { t } = useKubevirtTranslation();

  const columns: TableColumn<V1GPU | V1HostDevice>[] = React.useMemo(
    () => [
      {
        title: t('Name'),
        id: 'name',
        props: { className: 'pf-m-width-20' },
      },
      {
        title: t('Device name'),
        id: 'deviceName',
        props: { className: 'pf-m-width-30' },
      },
      {
        title: '',
        id: '',
        props: { className: 'dropdown-kebab-pf pf-c-table__action' },
      },
    ],
    [t],
  );

  return columns;
};

export default useHardwareDevicesColumns;
