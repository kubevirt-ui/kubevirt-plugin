import React, { FC, useMemo } from 'react';

import { modelToGroupVersionKind, StorageClassModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { getCluster } from '@multicluster/helpers/selectors';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { getVirtualMachineStorageClasses } from '@virtualmachines/utils/mappers';

import { VMCellWithCallbacksProps } from './types';

const VMStorageClassCell: FC<VMCellWithCallbacksProps> = ({ callbacks, row }) => {
  const clusterParam = useClusterParam();

  const storageClasses = useMemo(
    () => (row ? getVirtualMachineStorageClasses(row, callbacks.pvcMapper) : []),
    [row, callbacks.pvcMapper],
  );

  if (!row) return null;

  const vmCluster = getCluster(row) ?? clusterParam;

  if (isEmpty(storageClasses)) {
    return <>{NO_DATA_DASH}</>;
  }

  return (
    <>
      {storageClasses.map((storageClass) => (
        <MulticlusterResourceLink
          cluster={vmCluster}
          groupVersionKind={modelToGroupVersionKind(StorageClassModel)}
          key={storageClass}
          name={storageClass}
        />
      ))}
    </>
  );
};

export default VMStorageClassCell;
