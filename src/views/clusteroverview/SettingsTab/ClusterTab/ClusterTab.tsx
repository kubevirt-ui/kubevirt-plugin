import React, { FC } from 'react';

import { Divider } from '@patternfly/react-core';

import AutomaticSubscriptionRHELGuests from './components/AutomaticSubscriptionRHELGuests/AutomaticSubscriptionRHELGuests';
import EnableLoadBalancerSection from './components/EnableLoadBalancerSection/EnableLoadBalancerSection';
import EnablePreviewFeaturesSection from './components/EnablePreviewFeaturesSection/EnablePreviewFeaturesSection';
import GeneralInformation from './components/GeneralInformation/GeneralInformation';
import LiveMigrationSection from './components/LiveMigrationSection/LiveMigrationSection';
import TemplatesProjectSection from './components/TemplatesProjectSection/TemplatesProjectSection';

const ClusterTab: FC = () => {
  return (
    <>
      <GeneralInformation />
      <EnablePreviewFeaturesSection />
      <Divider className="section-divider" />
      <LiveMigrationSection />
      <Divider className="section-divider" />
      <AutomaticSubscriptionRHELGuests />
      <Divider className="section-divider" />
      <EnableLoadBalancerSection />
      <Divider className="section-divider" />
      <TemplatesProjectSection />
    </>
  );
};

export default ClusterTab;
