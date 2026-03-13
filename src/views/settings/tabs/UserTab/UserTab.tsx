import React, { FC } from 'react';

import { Divider } from '@patternfly/react-core';
import { useIsSpokeCluster } from '@settings/context/SettingsClusterContext';

import GettingStartedSection from './components/GettingStartedSection/GettingStartedSection';
import ManageSSHKeySection from './components/ManageSSHKeySection/ManageSSHKeySection';
import TaskPermissionsSection from './components/TaskPermissionsSection/TaskPermissionsSection';

import './user-tab.scss';

const UserTab: FC = () => {
  const isSpokeCluster = useIsSpokeCluster();

  return (
    <>
      <ManageSSHKeySection />
      <Divider className="settings-tab__section-divider" />
      <TaskPermissionsSection />
      {!isSpokeCluster && (
        <>
          <Divider className="settings-tab__section-divider" />
          <GettingStartedSection />
        </>
      )}
    </>
  );
};

export default UserTab;
