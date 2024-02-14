import React, { FC } from 'react';
import { useHistory } from 'react-router-dom';

import { MigrationPolicyModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ListPageCreateDropdown } from '@openshift-console/dynamic-plugin-sdk';

import { createItems, migrationPoliciesPageBaseURL } from '../../utils/constants';

const MigrationPoliciesCreateButton: FC = () => {
  const { t } = useKubevirtTranslation();
  const history = useHistory();

  const onCreate = (type: string) => {
    return type === 'form'
      ? history.push(`${migrationPoliciesPageBaseURL}/form`)
      : history.push(`${migrationPoliciesPageBaseURL}/~new`);
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
