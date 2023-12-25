import { useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';

import { HardwareDevicePageRow } from '../../utils/constants';

const useHardwareDevicesPageColumns = () => {
  const { t } = useKubevirtTranslation();

  const columns: TableColumn<HardwareDevicePageRow>[] = useMemo(
    () => [
      {
        id: 'resourceName',
        props: { className: 'pf-m-width-20' },
        title: t('Device name'),
      },
      {
        id: 'selector',
        props: { className: 'pf-m-width-20' },
        title: t('Selector'),
      },
    ],
    [t],
  );
  return columns;
};

export default useHardwareDevicesPageColumns;
