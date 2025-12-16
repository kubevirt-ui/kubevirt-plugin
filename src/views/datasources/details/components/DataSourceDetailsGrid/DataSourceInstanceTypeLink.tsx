import React, { FC } from 'react';

import { DEFAULT_INSTANCETYPE_LABEL } from '@catalog/CreateFromInstanceTypes/utils/constants';
import {
  VirtualMachineClusterInstancetypeModelGroupVersionKind,
  VirtualMachineInstancetypeModelGroupVersionKind,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { hasUserInstanceType } from '@kubevirt-utils/resources/bootableresources/helpers';
import { getLabel, getNamespace } from '@kubevirt-utils/resources/shared';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';

type DataSourceInstanceTypeLinkProps = {
  dataSource: V1beta1DataSource;
};

const DataSourceInstanceTypeLink: FC<DataSourceInstanceTypeLinkProps> = ({ dataSource }) => {
  const hasDataSourceUserInstanceType = hasUserInstanceType(dataSource);

  return (
    <ResourceLink
      groupVersionKind={
        hasDataSourceUserInstanceType
          ? VirtualMachineInstancetypeModelGroupVersionKind
          : VirtualMachineClusterInstancetypeModelGroupVersionKind
      }
      name={getLabel(dataSource, DEFAULT_INSTANCETYPE_LABEL)}
      namespace={hasDataSourceUserInstanceType && getNamespace(dataSource)}
    />
  );
};

export default DataSourceInstanceTypeLink;
