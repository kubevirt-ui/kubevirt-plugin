import * as React from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Breadcrumb, BreadcrumbItem } from '@patternfly/react-core';

import { useMigrationPoliciesPageBaseURL } from '../../../hooks/useMigrationPoliciesPageBaseURL';

import './MigrationPolicyBreadcrumb.scss';

export const MigrationPolicyBreadcrumb: React.FC = () => {
  const { t } = useKubevirtTranslation();
  const migrationPoliciesBaseURL = useMigrationPoliciesPageBaseURL();

  return (
    <Breadcrumb>
      <BreadcrumbItem>
        <Link to={migrationPoliciesBaseURL}>{t('MigrationPolicies')}</Link>
      </BreadcrumbItem>
      <BreadcrumbItem>{t('MigrationPolicy details')}</BreadcrumbItem>
    </Breadcrumb>
  );
};
export default MigrationPolicyBreadcrumb;
