import React, { FC, useMemo } from 'react';

import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import ListSkeleton from '@kubevirt-utils/components/StateHandler/ListSkeleton';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ClusterUserDefinedNetworkKind } from '@kubevirt-utils/resources/udn/types';
import { ListPageBody } from '@openshift-console/dynamic-plugin-sdk';

import { ProjectWithVMCount } from '../../types';

import useProjectsWithVMCounts from './hooks/useProjectsWithVMCounts';
import {
  getConnectedProjectRowId,
  getConnectedProjectsColumns,
} from './connectedProjectsDefinition';
import { CONNECTED_PROJECTS_COLUMN_KEYS } from './constants';

type ConnectedProjectsProps = {
  obj: ClusterUserDefinedNetworkKind;
};

const ConnectedProjects: FC<ConnectedProjectsProps> = ({ obj }) => {
  const { t } = useKubevirtTranslation();
  const [projectsWithVMCounts, loaded, error] = useProjectsWithVMCounts(obj);

  const columns = useMemo(() => getConnectedProjectsColumns(t), [t]);

  if (!loaded) {
    return (
      <ListPageBody>
        <ListSkeleton />
      </ListPageBody>
    );
  }

  return (
    <ListPageBody>
      <KubevirtTable<ProjectWithVMCount>
        ariaLabel={t('Connected projects table')}
        columns={columns}
        data={projectsWithVMCounts}
        dataTest="connected-projects-table"
        fixedLayout
        getRowId={getConnectedProjectRowId}
        initialSortKey={CONNECTED_PROJECTS_COLUMN_KEYS.name}
        loaded={loaded}
        loadError={error}
        noDataMsg={t('No connected projects found')}
        unfilteredData={projectsWithVMCounts}
      />
    </ListPageBody>
  );
};

export default ConnectedProjects;
