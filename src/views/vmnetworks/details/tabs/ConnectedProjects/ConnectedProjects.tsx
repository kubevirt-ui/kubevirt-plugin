import React, { FC } from 'react';

import ListSkeleton from '@kubevirt-utils/components/StateHandler/ListSkeleton';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ClusterUserDefinedNetworkKind } from '@kubevirt-utils/resources/udn/types';
import { ListPageBody, VirtualizedTable } from '@openshift-console/dynamic-plugin-sdk';

import { ProjectWithVMCount } from '../../types';

import useProjectsWithVMCounts from './hooks/useProjectsWithVMCounts';
import ConnectedProjectsRow from './ConnectedProjectsRow';

type ConnectedProjectsProps = {
  obj: ClusterUserDefinedNetworkKind;
};

const ConnectedProjects: FC<ConnectedProjectsProps> = ({ obj }) => {
  const { t } = useKubevirtTranslation();
  const [projectsWithVMCounts, loaded, error] = useProjectsWithVMCounts(obj);

  if (!loaded)
    return (
      <ListPageBody>
        <ListSkeleton />
      </ListPageBody>
    );

  return (
    <ListPageBody>
      <VirtualizedTable<ProjectWithVMCount>
        columns={[
          {
            id: 'name',
            sort: 'projectName',
            title: t('Name'),
          },
          {
            id: 'connected-vms',
            sort: 'vmCount',
            title: t('Connected virtual machines'),
          },
        ]}
        data={projectsWithVMCounts}
        loaded={loaded}
        loadError={error}
        Row={ConnectedProjectsRow}
        unfilteredData={projectsWithVMCounts}
      />
    </ListPageBody>
  );
};

export default ConnectedProjects;
