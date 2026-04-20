import React, { FCC } from 'react';
import { useLocation } from 'react-router';

import { V1alpha1MigrationPolicy } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { PageSection } from '@patternfly/react-core';

import MigrationPolicyDetailsSection from './components/MigrationPolicyDetailsSection/MigrationPolicyDetailsSection';

import './MigrationPolicyDetailsPage.scss';

type MigrationPolicyDetailsPageProps = {
  obj: V1alpha1MigrationPolicy;
};

const MigrationPolicyDetailsPage: FCC<MigrationPolicyDetailsPageProps> = ({ obj: mp }) => {
  const location = useLocation();
  return (
    <div className="migration-policy-details-page">
      <PageSection>
        <MigrationPolicyDetailsSection mp={mp} pathname={location?.pathname} />
      </PageSection>
    </div>
  );
};

export default MigrationPolicyDetailsPage;
