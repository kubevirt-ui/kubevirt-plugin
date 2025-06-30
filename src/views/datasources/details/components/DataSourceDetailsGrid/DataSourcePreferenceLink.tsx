import React, { FC } from 'react';

import { DEFAULT_PREFERENCE_LABEL } from '@catalog/CreateFromInstanceTypes/utils/constants';
import {
  VirtualMachineClusterPreferenceModelGroupVersionKind,
  VirtualMachinePreferenceModelGroupVersionKind,
} from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { hasUserPreference } from '@kubevirt-utils/resources/bootableresources/helpers';
import { getLabel, getNamespace } from '@kubevirt-utils/resources/shared';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';

type DataSourcePreferenceLinkProps = {
  dataSource: V1beta1DataSource;
};

const DataSourcePreferenceLink: FC<DataSourcePreferenceLinkProps> = ({ dataSource }) => {
  const hasDataSourceUserPreference = hasUserPreference(dataSource);

  return (
    <ResourceLink
      groupVersionKind={
        hasDataSourceUserPreference
          ? VirtualMachinePreferenceModelGroupVersionKind
          : VirtualMachineClusterPreferenceModelGroupVersionKind
      }
      name={getLabel(dataSource, DEFAULT_PREFERENCE_LABEL)}
      namespace={hasDataSourceUserPreference && getNamespace(dataSource)}
    />
  );
};

export default DataSourcePreferenceLink;
