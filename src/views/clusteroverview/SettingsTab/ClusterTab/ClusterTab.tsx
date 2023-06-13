import React, { FC } from 'react';

import { Divider } from '@patternfly/react-core';

import EnableInstanceTypeSection from './components/EnableInstanceTypeSection/EnableInstanceTypeSection';
import GeneralInforamtion from './components/GeneralInforamtion/GeneralInforamtion';
import LiveMigrationSection from './components/LiveMigrationSection/LiveMigrationSection';
import TemplatesProjectSection from './components/TemplatesProjectSection/TemplatesProjectSection';

const ClusterTab: FC = () => {
  return (
    <>
      <GeneralInforamtion />
      <LiveMigrationSection />
      <Divider className="section-divider" />
      <TemplatesProjectSection />
      <Divider className="section-divider" />
      <EnableInstanceTypeSection />
    </>
  );
};

export default ClusterTab;
