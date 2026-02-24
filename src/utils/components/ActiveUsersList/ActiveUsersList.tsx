import React, { FC, useMemo } from 'react';

import { V1VirtualMachineInstanceGuestOSUser } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { getActiveUserColumns, getActiveUserRowId } from './activeUsersListDefinition';

type ActiveUsersListProps = {
  data: V1VirtualMachineInstanceGuestOSUser[];
  loaded: boolean;
  loadError?: Error;
};

const ActiveUsersList: FC<ActiveUsersListProps> = ({ data, loaded, loadError }) => {
  const { t } = useKubevirtTranslation();

  const columns = useMemo(() => getActiveUserColumns(t), [t]);

  return (
    <KubevirtTable
      ariaLabel={t('Active users table')}
      columns={columns}
      data={data}
      dataTest="active-users-list"
      getRowId={getActiveUserRowId}
      initialSortKey="userName"
      loaded={loaded}
      loadError={loadError}
      noDataEmptyText={t('No active users')}
    />
  );
};

export default ActiveUsersList;
