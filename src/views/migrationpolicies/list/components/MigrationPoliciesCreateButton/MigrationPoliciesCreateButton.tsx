import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { MigrationPolicyModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ListPageCreateDropdown } from '@openshift-console/dynamic-plugin-sdk';

import { createItems, migrationPoliciesPageBaseURL } from '../../utils/constants';

const MigrationPoliciesCreateButton: FC = () => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();

  const onCreate = (type: string) => {
    return type === 'form'
      ? navigate(`${migrationPoliciesPageBaseURL}/form`)
      : navigate(`${migrationPoliciesPageBaseURL}/~new`);
  };

  return (
    <ListPageCreateDropdown
      createAccessReview={{ groupVersionKind: MigrationPolicyModelGroupVersionKind }}
      items={createItems}
      onClick={onCreate}
    >
      {t('Create MigrationPolicy')}
    </ListPageCreateDropdown>
  );
};

export default MigrationPoliciesCreateButton;
