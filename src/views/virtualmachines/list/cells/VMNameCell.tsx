import React, { FC } from 'react';

import { VirtualMachineModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { getCluster } from '@multicluster/helpers/selectors';
import useClusterParam from '@multicluster/hooks/useClusterParam';

import { VMCellProps } from './types';

const VMNameCell: FC<VMCellProps> = ({ row }) => {
  const clusterParam = useClusterParam();

  if (!row) return null;

  const vmCluster = getCluster(row) ?? clusterParam;
  const vmName = getName(row);
  const vmNamespace = getNamespace(row);

  return (
    <MulticlusterResourceLink
      cluster={vmCluster}
      data-test={`vm-name-${vmName}`}
      groupVersionKind={VirtualMachineModelGroupVersionKind}
      name={vmName}
      namespace={vmNamespace}
    />
  );
};

export default VMNameCell;
