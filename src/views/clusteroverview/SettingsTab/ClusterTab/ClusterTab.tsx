import React, { FC } from 'react';

import { Divider } from '@patternfly/react-core';

import EnableLoadBalancerSection from './components/EnableLoadBalancerSection/EnableLoadBalancerSection';
import EnablePreviewFeaturesSection from './components/EnablePreviewFeaturesSection/EnablePreviewFeaturesSection';
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
      <EnablePreviewFeaturesSection />
      <Divider className="section-divider" />
      <EnableLoadBalancerSection />
    </>
  );
};

export default ClusterTab;
