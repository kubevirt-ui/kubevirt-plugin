import * as React from 'react';
import { RouteComponentProps } from 'react-router';

import { V1alpha1MigrationPolicy } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { PageSection } from '@patternfly/react-core';

import MigrationPolicyDetailsSection from './components/MigrationPolicyDetailsSection/MigrationPolicyDetailsSection';

import './MigrationPolicyDetailsPage.scss';

type MigrationPolicyDetailsPageProps = RouteComponentProps & {
  obj: V1alpha1MigrationPolicy;
};
const MigrationPolicyDetailsPage: React.FC<MigrationPolicyDetailsPageProps> = ({
  obj: mp,
  location,
}) => {
  return (
    <div className="migration-policy-details-page">
      <PageSection>
        <MigrationPolicyDetailsSection mp={mp} pathname={location?.pathname} />
      </PageSection>
    </div>
  );
};

export default MigrationPolicyDetailsPage;
