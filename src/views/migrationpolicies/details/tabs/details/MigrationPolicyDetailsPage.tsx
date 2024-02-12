import React, { FC } from 'react';
import { useLocation } from 'react-router-dom-v5-compat';

import { V1alpha1MigrationPolicy } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { PageSection, PageSectionVariants } from '@patternfly/react-core';

import MigrationPolicyDetailsSection from './components/MigrationPolicyDetailsSection/MigrationPolicyDetailsSection';

import './MigrationPolicyDetailsPage.scss';

type MigrationPolicyDetailsPageProps = {
  obj: V1alpha1MigrationPolicy;
};

const MigrationPolicyDetailsPage: FC<MigrationPolicyDetailsPageProps> = ({ obj: mp }) => {
  const location = useLocation();
  return (
    <div className="migration-policy-details-page">
      <PageSection variant={PageSectionVariants.light}>
        <MigrationPolicyDetailsSection mp={mp} pathname={location?.pathname} />
      </PageSection>
    </div>
  );
};

export default MigrationPolicyDetailsPage;
