import React, { FC } from 'react';

import { Divider } from '@patternfly/react-core';

import GettingStartedSection from './components/GettingStartedSection/GettingStartedSection';
import ManageSSHKeySection from './components/ManageSSHKeySection/ManageSSHKeySection';
import TaskPermissionsSection from './components/TaskPermissionsSection/TaskPermissionsSection';

import './user-tab.scss';

const UserTab: FC = () => {
  return (
    <>
      <ManageSSHKeySection />
      <Divider className="section-divider" />
      <TaskPermissionsSection />
      <Divider className="section-divider" />
      <GettingStartedSection />
    </>
  );
};

export default UserTab;
