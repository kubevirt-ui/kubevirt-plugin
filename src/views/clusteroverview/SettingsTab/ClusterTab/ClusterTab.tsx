import React, { FC } from 'react';

import { Divider } from '@patternfly/react-core';

import EnableInstanceTypeSection from './components/EnableInstanceTypeSection/EnableInstanceTypeSection';
import EnableLoadBalancerSection from './components/EnableLoadBalancerSection/EnableLoadBalancerSection';
import GeneralInformation from './components/GeneralInformation/GeneralInformation';
import LiveMigrationSection from './components/LiveMigrationSection/LiveMigrationSection';
import TemplatesProjectSection from './components/TemplatesProjectSection/TemplatesProjectSection';

const ClusterTab: FC = () => {
  return (
    <>
      <GeneralInformation />
      <LiveMigrationSection />
      <Divider className="section-divider" />
      <TemplatesProjectSection />
      <Divider className="section-divider" />
      <EnableInstanceTypeSection />
      <Divider className="section-divider" />
      <EnableLoadBalancerSection />
    </>
  );
};

export default ClusterTab;
