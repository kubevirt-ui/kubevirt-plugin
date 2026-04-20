import React, { ReactNode } from 'react';
import { TFunction } from 'i18next';

import { V1VirtualMachineInstanceGuestOSUser } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import Timestamp from '@kubevirt-utils/components/Timestamp/Timestamp';
import { fromNow } from '@kubevirt-utils/components/Timestamp/utils/datetime';
import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';

const renderLoginTime = (user: V1VirtualMachineInstanceGuestOSUser): ReactNode => {
  if (isEmpty(user?.loginTime)) return NO_DATA_DASH;
  const time = user.loginTime * 1000;
  return <Timestamp timestamp={time} />;
};

const renderElapsedTime = (user: V1VirtualMachineInstanceGuestOSUser): ReactNode => {
  if (isEmpty(user?.loginTime)) return NO_DATA_DASH;
  const time = user.loginTime * 1000;
  return fromNow(new Date(time), new Date());
};

export const getActiveUserColumns = (
  t: TFunction,
): ColumnConfig<V1VirtualMachineInstanceGuestOSUser, undefined>[] => [
  {
    getValue: (r) => r.userName ?? '',
    key: 'userName',
    label: t('User Name'),
    renderCell: (r) => r.userName ?? NO_DATA_DASH,
    sortable: true,
  },
  {
    getValue: (r) => r.domain ?? '',
    key: 'domain',
    label: t('Domain'),
    renderCell: (r) => r.domain ?? NO_DATA_DASH,
    sortable: true,
  },
  {
    getValue: (r) => r.loginTime ?? 0,
    key: 'loginTime',
    label: t('Time of login'),
    renderCell: renderLoginTime,
    sortable: true,
  },
  {
    getValue: (r) => r.loginTime ?? 0,
    key: 'elapsedTime',
    label: t('Elapsed time since login'),
    renderCell: renderElapsedTime,
    sortable: false,
  },
];

export const getActiveUserRowId = (user: V1VirtualMachineInstanceGuestOSUser): string =>
  `${user.userName ?? NO_DATA_DASH}-${user.domain ?? NO_DATA_DASH}-${user.loginTime ?? 0}`;
