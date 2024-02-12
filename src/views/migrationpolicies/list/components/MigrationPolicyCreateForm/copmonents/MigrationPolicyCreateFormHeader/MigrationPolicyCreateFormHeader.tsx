import React from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { migrationPoliciesPageBaseURL } from '../../../../utils/constants';

const MigrationPolicyCreateFormHeader: React.FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <h1 className="migration-policy__form-header">
      <div>{t('Create MigrationPolicy')}</div>
      <Link
        className="migration-policy__form-header-link"
        to={`${migrationPoliciesPageBaseURL}/~new`}
      >
        {t('Edit YAML')}
      </Link>
    </h1>
  );
};

export default MigrationPolicyCreateFormHeader;
