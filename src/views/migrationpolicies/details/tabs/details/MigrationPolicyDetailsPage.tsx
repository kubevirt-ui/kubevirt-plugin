import React, { type FC } from 'react';
import { useLocation } from 'react-router';

import { type V1alpha1MigrationPolicy } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { PageSection } from '@patternfly/react-core';

import MigrationPolicyDetailsSection from './components/MigrationPolicyDetailsSection/MigrationPolicyDetailsSection';

import './MigrationPolicyDetailsPage.scss';

type MigrationPolicyDetailsPageProps = {
  obj: V1alpha1MigrationPolicy;
};

const MigrationPolicyDetailsPage: FC<MigrationPolicyDetailsPageProps> = ({
  obj: migrationPolicy,
}) => {
  const location = useLocation();
  return (
    <div className="migration-policy-details-page">
      <PageSection>
        <MigrationPolicyDetailsSection mp={migrationPolicy} pathname={location?.pathname} />
      </PageSection>
    </div>
  );
};

export default MigrationPolicyDetailsPage;
