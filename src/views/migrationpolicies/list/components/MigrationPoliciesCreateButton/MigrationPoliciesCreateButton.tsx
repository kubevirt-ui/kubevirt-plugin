import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { MigrationPolicyModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import MigrationPolicyModel from '@kubevirt-ui/kubevirt-api/console/models/MigrationPolicyModel';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  K8sVerb,
  ListPageCreateDropdown,
  useAccessReview,
} from '@openshift-console/dynamic-plugin-sdk';
import { Button, Tooltip } from '@patternfly/react-core';

import { createItems, migrationPoliciesPageBaseURL } from '../../utils/constants';

const MigrationPoliciesCreateButton: FC = () => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();

  const [canCreateMigrationPolicy] = useAccessReview({
    group: MigrationPolicyModel.apiGroup,
    resource: MigrationPolicyModel.plural,
    verb: 'create' as K8sVerb,
  });

  const onCreate = (type: string) => {
    return type === 'form'
      ? navigate(`${migrationPoliciesPageBaseURL}/form`)
      : navigate(`${migrationPoliciesPageBaseURL}/~new`);
  };

  if (!canCreateMigrationPolicy) {
    return (
      <Tooltip
        content={t(
          'To perform this action you must get permission from your Organization Administrator.',
        )}
      >
        <Button isAriaDisabled>{t('Create MigrationPolicy')}</Button>
      </Tooltip>
    );
  }

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
