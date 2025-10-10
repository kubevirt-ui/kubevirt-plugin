import React from 'react';
import { Link } from 'react-router-dom-v5-compat';
import { useMigrationPoliciesPageBaseURL } from 'src/views/migrationpolicies/hooks/useMigrationPoliciesPageBaseURL';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Title } from '@patternfly/react-core';

const MigrationPolicyCreateFormHeader: React.FC = () => {
  const { t } = useKubevirtTranslation();
  const migrationPoliciesBaseURL = useMigrationPoliciesPageBaseURL();

  return (
    <Title className="migration-policy__form-header" headingLevel="h1">
      <div>{t('Create MigrationPolicy')}</div>
      <Link className="migration-policy__form-header-link" to={`${migrationPoliciesBaseURL}/~new`}>
        {t('Edit YAML')}
      </Link>
    </Title>
  );
};

export default MigrationPolicyCreateFormHeader;
