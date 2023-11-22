import React, { FC } from 'react';

import { Divider } from '@patternfly/react-core';

import ManageSSHKeySection from './components/ManageSSHKeySection/ManageSSHKeySection';
import TaskPermissionsSection from './components/TaskPermissionsSection/TaskPermissionsSection';
import WelcomeSection from './components/WelcomeSection/WelcomeSection';

import './user-tab.scss';

const UserTab: FC = () => {
  return (
    <>
      <ManageSSHKeySection />
      <Divider className="section-divider" />
      <TaskPermissionsSection />
      <Divider className="section-divider" />
      <WelcomeSection />
    </>
  );
};

export default UserTab;
