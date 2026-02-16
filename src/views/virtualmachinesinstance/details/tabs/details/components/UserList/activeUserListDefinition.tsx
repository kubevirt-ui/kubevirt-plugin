import React from 'react';
import { TFunction } from 'react-i18next';

import { V1VirtualMachineInstanceGuestOSUser } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import Timestamp from '@kubevirt-utils/components/Timestamp/Timestamp';
import { fromNow } from '@kubevirt-utils/components/Timestamp/utils/datetime';
import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';

/** Render the login time as a timestamp */
const renderLoginTime = (user: V1VirtualMachineInstanceGuestOSUser): React.ReactNode => {
  if (user?.loginTime == null) return NO_DATA_DASH;
  const time = user.loginTime * 1000;
  return <Timestamp timestamp={time} />;
};

/** Render the elapsed time since login */
const renderElapsedTime = (user: V1VirtualMachineInstanceGuestOSUser): React.ReactNode => {
  if (user?.loginTime == null) return NO_DATA_DASH;
  return fromNow(new Date(user.loginTime * 1000), new Date());
};

/** Column definitions for the active users table */
export const getActiveUserColumns = (
  t: TFunction,
): ColumnConfig<V1VirtualMachineInstanceGuestOSUser, undefined>[] => [
  {
    getValue: (r) => r?.userName || '',
    key: 'userName',
    label: t('User Name'),
    renderCell: (r) => r?.userName || '-',
    sortable: true,
  },
  {
    getValue: (r) => r?.domain || '',
    key: 'domain',
    label: t('Domain'),
    renderCell: (r) => r?.domain || '-',
    sortable: true,
  },
  {
    getValue: (r) => r?.loginTime || 0,
    key: 'loginTime',
    label: t('Time of login'),
    renderCell: renderLoginTime,
    sortable: true,
  },
  {
    key: 'elapsedTime',
    label: t('Elapsed time since login'),
    renderCell: renderElapsedTime,
  },
];

/** Generate unique row ID for active user rows */
export const getActiveUserRowId = (
  user: V1VirtualMachineInstanceGuestOSUser,
  index: number,
): string => `${user?.userName}-${user?.domain}-${index}`;
